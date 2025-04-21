import React, { useEffect, useState } from 'react';
import { marked } from 'marked'; // 마크다운 변환을 위한 라이브러리
import DOMPurify from 'dompurify'; // HTML을 안전하게 처리하기 위한 라이브러리
import './SermonOutput.css'; // CSS 파일 임포트

interface SermonOutputProps {
    sermon: string; // 마크다운 형식의 설교문
}

const SermonOutputComponent: React.FC<SermonOutputProps> = ({ sermon }) => {
    const [safeHtmlContent, setSafeHtmlContent] = useState<string>(''); // 변환된 HTML 상태
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        const convertMarkdownToHtml = async () => {
            setLoading(true); // 로딩 시작
            const htmlContent = await marked(sermon); // 마크다운을 HTML로 변환
            const sanitizedHtml = DOMPurify.sanitize(htmlContent); // HTML을 안전하게 처리
            setSafeHtmlContent(sanitizedHtml); // 상태 업데이트
            setLoading(false); // 로딩 종료
        };

        convertMarkdownToHtml(); // 비동기 함수 호출
    }, [sermon]); // sermon이 변경될 때마다 실행

    return (
        <div className="sermon-output">
            {loading ? (
                <p>로딩 중...</p> // 로딩 중일 때 표시할 메시지
            ) : (
                <div dangerouslySetInnerHTML={{ __html: safeHtmlContent }} /> // HTML로 변환된 설교문 출력
            )}
        </div>
    );
};

export default SermonOutputComponent;
