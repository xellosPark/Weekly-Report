

type UseAutoLogoutOpts = {
    limitMs?: number;
    user: {name?: string; role?: number; type?: string} | null;
    isTargetUser: (user: UseAutoLogoutOpts["user"]) => boolean; //특정 유저 판별
    
}