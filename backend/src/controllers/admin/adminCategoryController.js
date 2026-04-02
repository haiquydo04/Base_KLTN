import Tag from '../../models/Tag.js';
import User from '../../models/User.js';
import UserTag from '../../models/UserTag.js';
import AdminLog from '../../models/AdminLog.js';

export const getCategories = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Tag.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Tag.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách danh mục' });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, category, description, icon } = req.body;
    const adminId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }

    const existing = await Tag.findOne({ name: name.trim(), category });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại trong nhóm này' });
    }

    const newTag = new Tag({
      name: name.trim(),
      category: category || 'general',
      description: description || '',
      icon: icon || '',
      status: 'active'
    });

    await newTag.save();

    await AdminLog.logAction(adminId, 'ADD_CATEGORY', {
      targetId: newTag._id,
      description: `Đã thêm danh mục mới: ${newTag.name} (Nhóm: ${newTag.category})`,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    res.status(201).json({ success: true, message: 'Cập nhật danh mục thành công', data: newTag });
  } catch (error) {
    console.error('Lỗi khi thêm danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm danh mục' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, icon } = req.body;
    const adminId = req.user._id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    // Check unique name in category
    const catToCheck = category || tag.category;
    const existing = await Tag.findOne({ name: name.trim(), category: catToCheck, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại trong nhóm này' });
    }

    const oldName = tag.name;
    tag.name = name.trim();
    if (category) tag.category = category;
    if (description !== undefined) tag.description = description;
    if (icon !== undefined) tag.icon = icon;

    await tag.save();

    await AdminLog.logAction(adminId, 'UPDATE_CATEGORY', {
      targetId: tag._id,
      description: `Đã cập nhật danh mục: ${oldName} -> ${tag.name}`,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    res.json({ success: true, message: 'Cập nhật danh mục thành công', data: tag });
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi chỉnh sửa danh mục' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    let inUseCount = 0;
    const tagName = tag.name;

    // Check constraint logic
    if (tag.category === 'interest') {
      inUseCount = await User.countDocuments({ interests: tagName });
      const userTagCount = await UserTag.countDocuments({ tagId: tag._id });
      inUseCount += userTagCount;
    } else if (tag.category === 'occupation') {
      inUseCount = await User.countDocuments({ occupation: tagName });
    } else if (tag.category === 'location') {
      inUseCount = await User.countDocuments({ location: tagName });
    } else {
      inUseCount = await UserTag.countDocuments({ tagId: tag._id });
    }

    if (inUseCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không được phép xóa danh mục đang có người dùng sử dụng. Hãy chuyển trạng thái sang Ẩn.' 
      });
    }

    await Tag.findByIdAndDelete(id);

    await AdminLog.logAction(adminId, 'DELETE_CATEGORY', {
      targetId: id,
      description: `Đã xóa danh mục: ${tagName} (Nhóm: ${tag.category})`,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa danh mục' });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    tag.status = tag.status === 'active' ? 'hidden' : 'active';
    await tag.save();

    await AdminLog.logAction(adminId, 'TOGGLE_CATEGORY_STATUS', {
      targetId: tag._id,
      description: `Chuyển trạng thái danh mục: ${tag.name} thành ${tag.status}`,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    res.json({ success: true, message: 'Cập nhật danh mục thành công', data: tag });
  } catch (error) {
    console.error('Lỗi khi đổi trạng thái danh mục:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
