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
        console.log('[Request Interceptor] 요청 시작:', config.url);
        const token = localStorage.getItem('accessToken');
        if (token) {
            console.log('[Request Interceptor] Access Token 추가:', token);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[Request Interceptor] 요청 중 오류 발생:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Access Token 만료 시 처리
api.interceptors.response.use(
    (response) => {
        console.log('[Response Interceptor] 응답 성공:', response);
        return response;
    },
    async (error) => {
        console.error('[Response Interceptor] 응답 오류 발생:', error);

        if (error.response?.status === 403) {
            console.warn('[Response Interceptor] Access Token 만료. Refresh Token 갱신 시도.');

            const originalRequest = error.config;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.error('[Response Interceptor] Refresh Token이 없습니다.');
                    throw new Error('Refresh Token이 없습니다.');
                }

                console.log('[Response Interceptor] Refresh Token 요청 시작');
                const { data } = await axios.post('http://localhost:9801/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                console.log('[Response Interceptor] Refresh Token 응답 수신:', data);

                // 새로운 토큰 저장
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                console.log('[Response Interceptor] 토큰 갱신 성공. 원래 요청 다시 시도.');

                // 원래 요청을 새로운 토큰으로 다시 시도
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.error('[Response Interceptor] 토큰 갱신 실패:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';  // 로그인 페이지로 이동
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
