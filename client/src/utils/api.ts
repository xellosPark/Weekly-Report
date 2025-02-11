// src/utils/api.ts
import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:9801',  // 서버 URL
    timeout: 5000,
});

// Request Interceptor: 요청에 Access Token 추가
api.interceptors.request.use(
    (config) => {
        console.log('[요청 인터셉터] 요청 시작:', config.url);
        const token = localStorage.getItem('accessToken');
        if (token) {
            console.log('[요청 인터셉터] Access Token 추가:', token);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[요청 인터셉터] 요청 중 오류 발생:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: 응답 처리 및 토큰 갱신
api.interceptors.response.use(
    (response) => {
        console.log('[응답 인터셉터] 응답 성공:', response);
        return response;
    },
    async (error) => {
        console.error('[응답 인터셉터] 응답 오류 발생:', error);

        const originalRequest = error.config;

        // Access Token 만료 또는 인증 오류 처리
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('[응답 인터셉터] Access Token 만료 또는 인증 오류 발생.');

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.error('[응답 인터셉터] Refresh Token이 없습니다.');
                    throw new Error('Refresh Token이 없습니다.');
                }

                console.log('[응답 인터셉터] Refresh Token으로 토큰 갱신 요청 시작');
                const { data } = await axios.post('http://localhost:9801/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                console.log('[응답 인터셉터] Refresh Token 응답 수신:', data);

                // 새 토큰을 로컬 스토리지에 저장
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                console.log('[응답 인터셉터] 토큰 갱신 성공. 원래 요청 다시 시도.');

                // 갱신된 토큰으로 원래 요청 다시 시도
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return null;
            } catch (refreshError) {
                console.error('[응답 인터셉터] 토큰 갱신 실패:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';  // 로그인 페이지로 이동
                return null;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
