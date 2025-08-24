import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './pages/Main';
import Profile from './pages/Profile';
import Join from './pages/Join';
import Login from './pages/Login';
import CommunityListPage from './pages/CommunityListPage';
import CommunityWritePage from './pages/CommunityWritePage';
import CommunityDetailPage from './pages/CommunityDetailPage';

/**
 * 애플리케이션의 메인 컴포넌트입니다.
 * react-router-dom을 사용하여 페이지 라우팅을 설정합니다.
 */
function App() {
  return (
    // Routes 컴포넌트는 여러 Route 중 현재 URL과 일치하는 첫 번째 Route를 렌더링합니다.
    <Routes>
      {/* Layout 컴포넌트를 부모 라우트로 사용합니다. */}
      {/* path="/"는 모든 하위 라우트들이 이 레이아웃을 공유하게 만듭니다. */}
      <Route path="/" element={<Layout />}>
        {/* index는 부모 라우트의 경로("/")와 정확히 일치할 때 렌더링될 컴포넌트를 지정합니다. */}
        {/* 즉, 사용자가 웹사이트의 루트에 접근했을 때 Main 페이지를 보여줍니다. */}
        <Route index element={<Main />} />

        {/* "/profile" 경로에 접근했을 때 Profile 페이지를 보여줍니다. */}
        <Route path="profile" element={<Profile />} />

        {/* "/join" 경로에 접근했을 때 Join 페이지를 보여줍니다. */}
        <Route path="join" element={<Join />} />

        {/* "/login" 경로에 접근했을 때 Login 페이지를 보여줍니다. */}
        <Route path="login" element={<Login />} />

        {/* 커뮤니티 관련 라우트 */}
        <Route path="community" element={<CommunityListPage />} />
        <Route path="community/new" element={<CommunityWritePage />} />
        <Route path="community/:id" element={<CommunityDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;