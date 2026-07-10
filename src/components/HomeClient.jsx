'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from './SettingsProvider';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import TestSetup from './TestSetup';
import TestHistory from './TestHistory';
import ProSheet from './ProSheet';
import styles from './HomeClient.module.css';

const JUST_COMPLETED_KEY = 'vocab-test-just-completed';

export default function HomeClient({ levels }) {
  const [tab, setTab] = useState('learn'); // 'learn' | 'test' | 'history'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const { theme, setTheme, shuffle, setShuffle } = useSettings();
  const { user, plan, signOut } = useAuth();

  // 테스트를 막 끝내고 돌아온 경우 기록 탭으로 자동 전환
  useEffect(() => {
    if (sessionStorage.getItem(JUST_COMPLETED_KEY)) {
      sessionStorage.removeItem(JUST_COMPLETED_KEY);
      setTab('history');
    }
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const isKakaoUser = user?.app_metadata?.provider === 'kakao';

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleKakaoLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    setAccountOpen(false);
  };

  return (
    <div className={styles.wrapper}>

      <header className={styles.header}>
        <div className={styles.brand}>
          <Image src="/icon.png" alt="" width={30} height={30} className={styles.brandIcon} />
          <h1 className={styles.title}>vocaw</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={() => (user ? setAccountOpen(true) : setLoginOpen(true))}
            aria-label={user ? '계정 열기' : '로그인 열기'}
          >
            {user ? (
              avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className={styles.avatarImg} />
              ) : (
                <span className={`${styles.avatarFallback} ${isKakaoUser ? styles.avatarFallbackKakao : ''}`}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )
            ) : (
              <Image src="/icons/account_logo.png" alt="계정" width={25} height={25} />
            )}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setSettingsOpen(true)}
            aria-label="설정 열기"
          >
            <Image src="/icons/settings.png" alt="설정" width={23} height={23} />
          </button>
        </div>
      </header>

      <main className={styles.container}>
        <div className={`${styles.segmented} ${styles.tabBar}`}>
          <button
            className={`${styles.segBtn} ${tab === 'learn' ? styles.segBtnActive : ''}`}
            onClick={() => setTab('learn')}
          >
            학습
          </button>
          <button
            className={`${styles.segBtn} ${tab === 'test' ? styles.segBtnActive : ''}`}
            onClick={() => setTab('test')}
          >
            테스트
          </button>
          <button
            className={`${styles.segBtn} ${tab === 'history' ? styles.segBtnActive : ''}`}
            onClick={() => setTab('history')}
          >
            기록
          </button>
        </div>

        {tab === 'learn' && (
          <>
            <p className={styles.subtitle}>학습할 레벨을 선택하세요</p>
            <div className={styles.levelList}>
              {levels.map(({ key, label, totalDays }, index) => (
                <Link
                  key={key}
                  href={`/${key}`}
                  className={styles.levelCard}
                  style={{ '--card-index': index }}
                >
                  <span className={styles.levelName}>{label}</span>
                  <span className={styles.levelMeta}>{totalDays}일 과정</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {tab === 'test' && (
          <TestSetup levels={levels} onRequestLogin={() => setLoginOpen(true)} />
        )}

        {tab === 'history' && (
          <TestHistory levels={levels} onRequestLogin={() => setLoginOpen(true)} />
        )}
      </main>

      {/* 설정 바텀 시트 */}
      {settingsOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>설정</h2>

            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingLabel}>테마</p>
                  <p className={styles.settingDesc}>테마 모드 선택</p>
                </div>
                <div className={styles.segmented}>
                  <button
                    className={`${styles.segBtn} ${theme === 'light' ? styles.segBtnActive : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    ☀️ 라이트
                  </button>
                  <button
                    className={`${styles.segBtn} ${theme === 'dark' ? styles.segBtnActive : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    🌙 다크
                  </button>
                </div>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <p className={styles.settingLabel}>학습 단어 순서</p>
                  <p className={styles.settingDesc}>학습 Day의 단어 배열 방식이에요. 테스트는 항상 무작위로 출제돼요.</p>
                </div>
                <div className={styles.segmented}>
                  <button
                    className={`${styles.segBtn} ${!shuffle ? styles.segBtnActive : ''}`}
                    onClick={() => setShuffle(false)}
                    style={{display: 'flex', justifyContent: 'center'}}
                  >
                    <Image src="/icons/fix.png" alt="설정" width={11} height={16} style={{marginRight: '4px'}}/> 고정
                  </button>
                  <button
                    className={`${styles.segBtn} ${shuffle ? styles.segBtnActive : ''}`}
                    onClick={() => setShuffle(true)}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <Image src="/icons/shuffle.png" alt="설정" width={14} height={14} style={{marginRight: '4px'}}/> 섞기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 바텀 시트 */}
      {loginOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setLoginOpen(false)}
        >
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>로그인</h2>

            <div className={styles.providerList}>
              <button
                className={styles.providerBtn}
                onClick={handleGoogleLogin}
              >
                <svg className={styles.providerIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.74z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78z" />
                  <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
                </svg>
                구글 계정으로 로그인
              </button>

              <button className={styles.providerBtn} onClick={handleKakaoLogin}>
                <span className={`${styles.providerIcon} ${styles.kakaoBadge}`}>K</span>
                카카오 계정으로 로그인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 바텀 시트 */}
      {accountOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setAccountOpen(false)}
        >
          <div
            className={styles.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHandle} />

            <div className={styles.accountInfo}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className={styles.accountAvatar} />
              ) : (
                <span className={`${styles.accountAvatarFallback} ${isKakaoUser ? styles.avatarFallbackKakao : ''}`}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className={styles.accountName}>{displayName}</p>
                <span className={`${styles.planBadge} ${plan === 'pro' ? styles.planBadgePro : ''}`}>
                  {plan === 'pro' ? 'Pro 플랜' : 'Free 플랜'}
                </span>
              </div>
            </div>

            <div className={styles.providerList}>
              {plan !== 'pro' && (
                <button
                  className={styles.providerBtn}
                  onClick={() => {
                    setAccountOpen(false);
                    setProOpen(true);
                  }}
                >
                  Pro 살펴보기
                </button>
              )}
              <button className={styles.providerBtn} onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      <ProSheet open={proOpen} onClose={() => setProOpen(false)} />
    </div>
  );
}