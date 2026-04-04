import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

const MIN_MATCH_THRESHOLD = 50;
const PAGE_SIZE = 20;
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80';

const DEFAULT_ME = {
  age: 26,
  relationshipGoal: 'long_term',
  interests: ['travel', 'coffee', 'music', 'running', 'design', 'books'],
};

const NAMES = [
  'Minh Anh', 'Duc Duy', 'Phuong Linh', 'Hoang Nam', 'Thu Trang', 'Lan Huong', 'Quoc Bao', 'Nhat Vy',
  'Gia Han', 'Thanh Tung', 'Bao Ngoc', 'My Tien', 'Khanh An', 'Bao Chau', 'Trung Kien', 'Huyen My',
  'Thao Nhi', 'Quynh Nhu', 'Anh Khoa', 'My Linh', 'Gia Bao', 'Ha Ngan', 'Phuc Nguyen', 'Ngan Ha',
  'Kieu Oanh', 'Dinh Quan', 'Ngoc Han', 'Bao Tram', 'Van Long', 'Nhu Y', 'Hai Dang', 'Thanh Vy',
  'Ngoc Minh', 'Duy Khanh', 'Phuong Thao', 'Bao Chau', 'Trung Hieu', 'Yen Nhi', 'Khai An', 'An Nhien',
  'Ngoc Mai', 'Tuan Phong', 'Linh Chi', 'Gia Khiem', 'Hong Nhung', 'Bao Lam', 'Thanh Ha', 'Nhat Minh',
  'My Uyen', 'Duc Huy',
];

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
];

const INTEREST_POOL = ['travel', 'music', 'coffee', 'running', 'hiking', 'gym', 'movies', 'books', 'yoga', 'food', 'art', 'gaming', 'photography', 'cooking'];
const BIO_POOL = [
  'Thich nhung cuoc hen nhe nhang, cafe va nhac acoustic.',
  'Huong ngoai vua du, uu tien su chan thanh trong giao tiep.',
  'Co gang song can bang: cong viec, gia dinh, ban be va hanh phuc.',
  'Me di chuyen, me chay bo buoi sang, tim nguoi dong hanh lau dai.',
  '',
];

const dedupeProfiles = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const computeCompatibilityScore = (userProfile, candidateProfile) => {
  const userInterests = userProfile.interests || [];
  const candidateInterests = candidateProfile.interests || [];
  const sharedInterests = candidateInterests.filter((tag) => userInterests.includes(tag));
  const interestRatio = userInterests.length ? sharedInterests.length / userInterests.length : 0;

  const ageGap = Math.abs((candidateProfile.age || 0) - (userProfile.age || 0));
  const ageScore = Math.max(0, 20 - ageGap * 1.8);
  const distanceScore = candidateProfile.distanceKm == null ? 8 : Math.max(0, 20 - candidateProfile.distanceKm);
  const goalScore = candidateProfile.relationshipGoal === userProfile.relationshipGoal ? 15 : 6;
  const confidencePoints = [candidateInterests.length >= 2, Boolean(candidateProfile.bio), candidateProfile.distanceKm != null].filter(Boolean).length;
  const lowConfidence = confidencePoints < 2;

  const total = interestRatio * 45 + ageScore + distanceScore + goalScore;
  const score = Math.max(0, Math.min(100, Math.round(total)));

  return {
    score,
    lowConfidence,
  };
};

const resolveMatchLabel = ({ score, mutualLike }) => {
  if (mutualLike) return 'CONNECTED';
  if (score >= 90) return 'HIGH_MATCH';
  if (score >= 70) return 'AI_SUGGESTED';
  if (score >= 50) return 'DISCOVERY';
  return 'LOW_MATCH';
};

const formatRelativeTime = (isoDateString) => {
  const now = Date.now();
  const then = new Date(isoDateString).getTime();
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(isoDateString));
};

const simulateFavoriteApi = (id) => {
  console.info('[favorite] request', { id });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error('POST /favorite failed'));
        return;
      }
      resolve({ ok: true });
    }, 450);
  });
};

const generateMockProfiles = () => {
  const now = Date.now();

  return NAMES.map((name, idx) => {
    const avatar_url = idx % 6 === 0 ? null : AVATARS[idx % AVATARS.length];
    const age = 22 + (idx % 10);
    const bio = BIO_POOL[idx % BIO_POOL.length];
    const interests = INTEREST_POOL.filter((_, i) => (i + idx) % 4 === 0).slice(0, idx % 2 === 0 ? 5 : 3);
    const distanceKm = idx % 5 === 0 ? null : (idx % 18) + 1;

    return {
      id: `mock-${idx + 1}`,
      name,
      age,
      avatar_url,
      bio,
      interests,
      relationshipGoal: idx % 3 === 0 ? 'long_term' : 'dating',
      match_time: new Date(now - (idx * 27 + 3) * 60000).toISOString(),
      likesMe: idx % 7 === 0,
      liked: idx % 11 === 0,
      blocked: idx % 31 === 0,
      reported: idx % 29 === 0,
      aiSuggested: idx % 4 === 0,
      distanceKm,
      locationName: idx % 5 === 0 ? null : `District ${1 + (idx % 10)}`,
      confidenceData: idx % 8 === 0 ? 'partial' : 'full',
    };
  });
};

const FilterPill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
      active ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 scale-[1.02]' : 'bg-rose-50 text-slate-600 hover:bg-rose-100'
    }`}
  >
    {children}
  </button>
);

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const me = {
    ...DEFAULT_ME,
    age: user?.age || DEFAULT_ME.age,
    interests: user?.interests?.length ? user.interests : DEFAULT_ME.interests,
  };

  const [rawProfiles, setRawProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [skippedIds, setSkippedIds] = useState(() => new Set());
  const [toast, setToast] = useState('');
  const [lastLoadFailed, setLastLoadFailed] = useState(false);

  const observerRef = useRef(null);
  const isRateLimitedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      setLoading(true);
      setFetchError('');
      setLastLoadFailed(false);

      try {
        await new Promise((resolve) => setTimeout(resolve, 900));
        if (!active) return;

        const mocked = dedupeProfiles(generateMockProfiles())
          .filter((profile) => !profile.blocked && !profile.reported);

        setRawProfiles(mocked);
      } catch (error) {
        console.error('[match] initial load error', error);
        if (active) setFetchError('Could not load matching profiles.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const processedProfiles = useMemo(() => {
    const mapped = rawProfiles.map((profile, index) => {
      const { score, lowConfidence } = computeCompatibilityScore(me, profile);
      const mutualLike = profile.likesMe && profile.liked;

      return {
        ...profile,
        compatibility_score: score,
        lowConfidence,
        mutualLike,
        match_label: resolveMatchLabel({ score, mutualLike }),
        relativeTime: formatRelativeTime(profile.match_time),
        stableIndex: index,
      };
    });

    return mapped
      .filter((profile) => !skippedIds.has(profile.id))
      .sort((a, b) => {
        if (b.compatibility_score !== a.compatibility_score) {
          return b.compatibility_score - a.compatibility_score;
        }

        const timeDiff = new Date(b.match_time).getTime() - new Date(a.match_time).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.stableIndex - b.stableIndex;
      });
  }, [me, rawProfiles, skippedIds]);

  const filteredProfiles = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    let list = processedProfiles;
    if (keyword) {
      list = list.filter((profile) => profile.name.toLowerCase().includes(keyword));
    }

    if (activeFilter === 'RECENT') {
      list = [...list].sort((a, b) => new Date(b.match_time).getTime() - new Date(a.match_time).getTime());
    }

    if (activeFilter === 'FAVORITE') {
      list = list.filter((profile) => profile.liked);
    }

    return list;
  }, [activeFilter, processedProfiles, searchKeyword]);

  const visibleProfiles = useMemo(() => filteredProfiles.slice(0, visibleCount), [filteredProfiles, visibleCount]);
  const hasMore = visibleCount < filteredProfiles.length;

  const aiSuggestionCount = useMemo(
    () => filteredProfiles.filter((profile) => profile.aiSuggested && profile.compatibility_score >= MIN_MATCH_THRESHOLD).length,
    [filteredProfiles]
  );

  const handleLike = async (profileId) => {
    const previous = rawProfiles;

    setRawProfiles((current) => current.map((item) => (item.id === profileId ? { ...item, liked: true } : item)));
    console.info('[match] like clicked', { profileId });

    try {
      await simulateFavoriteApi(profileId);
      setToast('Added to favorites');
    } catch (error) {
      console.error('[favorite] api error', error);
      setRawProfiles(previous);
      setToast('Failed to favorite. Rolled back.');
    }
  };

  const handleSkip = (profileId) => {
    console.info('[match] skip clicked', { profileId });
    setSkippedIds((current) => {
      const next = new Set(current);
      next.add(profileId);
      return next;
    });
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    if (isRateLimitedRef.current) return;

    isRateLimitedRef.current = true;
    setTimeout(() => {
      isRateLimitedRef.current = false;
    }, 400);

    setLoadingMore(true);
    setLastLoadFailed(false);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.08) {
            reject(new Error('Pagination failed'));
            return;
          }
          resolve();
        }, 550);
      });

      setVisibleCount((current) => current + PAGE_SIZE);
    } catch (error) {
      console.error('[match] load more failed', error);
      setLastLoadFailed(true);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  });

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, searchKeyword]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe4e6,_#fff8f7_50%,_#fff1f2)]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white/80 rounded-3xl p-5 shadow-sm border border-rose-100/80">
                <div className="h-52 rounded-2xl bg-rose-100/60" />
                <div className="h-5 bg-rose-100 rounded mt-4" />
                <div className="h-4 bg-rose-100 rounded mt-2 w-2/3" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe4e6,_#fff8f7_50%,_#fff1f2)]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-28">
          <div className="bg-white rounded-3xl p-8 text-center border border-rose-100 shadow-lg shadow-rose-200/20">
            <h2 className="text-xl font-bold text-slate-800">Unable to load matches</h2>
            <p className="text-slate-500 mt-2">Network error. Please retry.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffe4e6,_#fff8f7_45%,_#fff1f2)] text-slate-800">
      <Navbar />

      <main className="pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-600 to-rose-700 text-white p-6 md:p-10 shadow-[0_18px_60px_rgba(190,24,93,0.28)]">
          <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-pink-300/20 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-white/15 border border-white/25 rounded-full px-3 py-1.5">
                AI Magic
              </p>
              <h1 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight">Fresh Compatibility Signals</h1>
              <p className="mt-3 text-rose-50/90 max-w-xl">Mocked matching feed is active. Filter, search, like, skip, scroll, and open details before wiring real APIs.</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl px-5 py-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-100">Eligible profiles</p>
              <p className="text-3xl font-bold mt-1">{filteredProfiles.length}</p>
              <p className="text-sm text-rose-100 mt-1">Threshold: {MIN_MATCH_THRESHOLD}%</p>
            </div>
          </div>
        </section>

        {aiSuggestionCount > 0 && (
          <section className="mt-8 rounded-2xl bg-rose-100/70 border border-rose-200 px-5 py-4 flex items-center justify-between gap-4 animate-fade-in">
            <p className="font-semibold text-rose-800">AI found {aiSuggestionCount} high-potential suggestions for you.</p>
            <span className="text-xs font-bold text-rose-700 bg-rose-200/70 px-3 py-1 rounded-full">AI Banner</span>
          </section>
        )}

        <section className="mt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <label className="relative w-full lg:max-w-md">
            <input
              type="search"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Search by name..."
              className="w-full rounded-2xl bg-white border border-rose-100 pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              aria-label="Search profile"
            />
            <svg className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3m0 0A7.5 7.5 0 105.9 5.9a7.5 7.5 0 0010.8 10.8z" />
            </svg>
          </label>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <FilterPill active={activeFilter === 'ALL'} onClick={() => setActiveFilter('ALL')}>All</FilterPill>
            <FilterPill active={activeFilter === 'RECENT'} onClick={() => setActiveFilter('RECENT')}>Recent</FilterPill>
            <FilterPill active={activeFilter === 'FAVORITE'} onClick={() => setActiveFilter('FAVORITE')}>Favorite</FilterPill>
          </div>
        </section>

        {visibleProfiles.length === 0 ? (
          <section className="mt-10 bg-white rounded-3xl border border-rose-100 p-10 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800">No matches found</h3>
            <p className="text-slate-500 mt-2">Try a different keyword or reset your filter.</p>
            <Link
              to="/discover"
              className="inline-flex mt-6 px-6 py-3 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
            >
              Find more
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {visibleProfiles.map((profile, index) => {
              const scoreVisible = profile.compatibility_score >= MIN_MATCH_THRESHOLD;
              const cardDelay = `${Math.min(index, 12) * 35}ms`;

              return (
                <article
                  key={profile.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProfile(profile)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedProfile(profile);
                    }
                  }}
                  className="group bg-white rounded-3xl p-5 border border-rose-100 shadow-[0_12px_40px_rgba(190,24,93,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(190,24,93,0.18)] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  style={{ animation: `modal-slide-up 420ms ease-out both`, animationDelay: cardDelay }}
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-rose-100">
                    <img
                      src={profile.avatar_url || FALLBACK_AVATAR}
                      alt={`${profile.name} avatar`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    {profile.mutualLike && (
                      <span className="absolute top-3 right-3 text-[11px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                        CONNECTED
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900">{profile.name}, {profile.age}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Matched {profile.relativeTime}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {scoreVisible && !profile.lowConfidence && (
                        <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full">{profile.compatibility_score}% COMPATIBLE</span>
                      )}
                      {profile.lowConfidence && (
                        <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">LOW_CONFIDENCE</span>
                      )}
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{profile.match_label}</span>
                      {profile.distanceKm != null && (
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">{profile.distanceKm} km</span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleLike(profile.id)}
                        className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${profile.liked ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                        aria-label={`Like ${profile.name}`}
                      >
                        {profile.liked ? 'Favorited' : 'Like'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSkip(profile.id)}
                        className="rounded-xl py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        aria-label={`Skip ${profile.name}`}
                      >
                        Skip
                      </button>
                    </div>

                    {profile.mutualLike && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/messages');
                        }}
                        className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        Chat now
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div ref={observerRef} className="h-12" />

        {loadingMore && (
          <div className="text-center text-sm text-slate-500 mt-2">Loading more profiles...</div>
        )}

        {lastLoadFailed && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-500">Load failed. Please retry.</p>
            <button
              type="button"
              onClick={handleLoadMore}
              className="mt-2 px-4 py-2 text-sm rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </main>

      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center" onClick={() => setSelectedProfile(null)}>
          <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-2xl animate-slide-up" onClick={(event) => event.stopPropagation()}>
            <div className="grid md:grid-cols-2">
              <div className="h-[320px] md:h-full bg-rose-100">
                <img src={selectedProfile.avatar_url || FALLBACK_AVATAR} alt={selectedProfile.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedProfile.name}, {selectedProfile.age}</h2>
                    <p className="text-sm text-slate-500 mt-1">Matched {selectedProfile.relativeTime}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedProfile.compatibility_score >= MIN_MATCH_THRESHOLD && !selectedProfile.lowConfidence && (
                    <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full">{selectedProfile.compatibility_score}% COMPATIBLE</span>
                  )}
                  {selectedProfile.lowConfidence && (
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">LOW_CONFIDENCE</span>
                  )}
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">{selectedProfile.match_label}</span>
                  {selectedProfile.distanceKm != null && (
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">{selectedProfile.distanceKm} km away</span>
                  )}
                </div>

                <p className="mt-5 text-sm text-slate-600 leading-relaxed">{selectedProfile.bio || 'Profile is still incomplete, confidence may be lower.'}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedProfile.interests.map((tag) => (
                    <span key={tag} className="text-xs bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleLike(selectedProfile.id)}
                    className="flex-1 rounded-xl py-3 bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
                  >
                    Like profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSkip(selectedProfile.id)}
                    className="flex-1 rounded-xl py-3 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Skip profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Matches;
