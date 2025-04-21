// src/utils/api.ts
export const saveAPIKey = (key: string): void => {
    try {
        localStorage.setItem('apiKey', key);
        console.log('API Key 저장 성공');
    } catch (error) {
        console.error('API Key 저장 실패:', error);
    }
};

export const loadAPIKey = (): string | null => {
    try {
        const key = localStorage.getItem('apiKey');
        console.log('API Key 불러오기 성공:', key);
        return key;
    } catch (error) {
        console.error('API Key 불러오기 실패:', error);
        return null;
    }
};
