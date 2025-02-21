import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:9801',  // 서버 URL
    timeout: 5000,  // 타임아웃 시간 (5초)
});

// Request Interceptor: 요청 시 Access Token을 헤더에 추가
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log('[요청 인터셉터] 요청 시작:', config.url);

        const token = localStorage.getItem('accessToken');  // 로컬스토리지에서 accessToken 가져오기

        if (token) {
            console.log('[요청 인터셉터] Access Token 추가:', token);

            // AxiosHeaders로 헤더를 설정 (타입 호환을 위해 AxiosHeaders 사용)
            const headers = config.headers || {}; // headers가 undefined일 경우 빈 객체로 초기화

            console.log("📌 기존 요청 헤더:", headers); // 기존 헤더 로그

            // 새로운 Authorization 헤더를 포함한 AxiosHeaders 설정
            config.headers = new AxiosHeaders({
                ...headers, // 기존 헤더를 유지하면서 새로운 Authorization 헤더 추가
                Authorization: `Bearer ${token}`,
            });

            console.log("🔑 추가된 Authorization 헤더:", `Bearer ${token}`); // 추가된 토큰 로그
            console.log("📌 최종 설정된 요청 헤더:", config.headers); // 최종 헤더 로그
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('[요청 인터셉터] 요청 중 오류 발생:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor: 응답 처리 및 토큰 갱신
api.interceptors.response.use(
    (response: AxiosResponse) => {
        //console.log('[응답 인터셉터] 응답 성공:', response);
        return response;
    },
    async (error: AxiosError) => {
        console.error('[응답 인터셉터] 응답 오류 발생:', error);

        const originalRequest = error.config as InternalAxiosRequestConfig;  // 타입을 InternalAxiosRequestConfig으로 지정

        // originalRequest가 undefined일 수 있으므로 이를 처리
        if (!originalRequest) {
            console.error('[응답 인터셉터] 원래 요청이 정의되지 않았습니다.');
            return Promise.reject(error);
        }

        // 인증 오류(401) 또는 권한 오류(403) 발생 시
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('[응답 인터셉터] Access Token 만료 또는 인증 오류 발생.');

            try {
                // Refresh Token을 로컬스토리지에서 가져옴
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.error('[응답 인터셉터] Refresh Token이 없습니다.');
                    throw new Error('Refresh Token이 없습니다.');
                }

                //console.log('[응답 인터셉터] Refresh Token으로 토큰 갱신 요청 시작');
                // Refresh Token을 사용해 새로운 Access Token을 요청
                const { data } = await axios.post('http://localhost:9801/api/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` },
                });

                console.log('[응답 인터셉터] Refresh Token 응답 수신:', data);

                // 새 토큰을 로컬스토리지에 저장
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                console.log('[응답 인터셉터] 토큰 갱신 성공. 원래 요청 다시 시도.');

                // 갱신된 Access Token을 헤더에 추가하고 원래 요청을 다시 시도
                originalRequest.headers = new AxiosHeaders({
                    ...originalRequest.headers,
                    Authorization: `Bearer ${data.accessToken}`,
                });

                return api(originalRequest);  // 갱신된 토큰으로 요청 재시도
            } catch (refreshError) {
                console.error('[응답 인터셉터] 토큰 갱신 실패:', refreshError);
                // 토큰 갱신 실패 시, 로컬스토리지에서 토큰 삭제
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // window.location.href = '/login';  // 로그인 페이지로 리다이렉트
                return null;
            }
        }

        // 그 외의 오류 처리
        return Promise.reject(error);
    }
);

export default api;
