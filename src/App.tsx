import React, { useState, useEffect } from 'react';
import PromptInputComponent from './components/PromptInput';
import SermonOutputComponent from './components/SermonOutput';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const App: React.FC = () => {
    const [sermon, setSermon] = useState('');
    const [sermons, setSermons] = useState<any[]>([]);
    const [progressLog, setProgressLog] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [sermonDetails, setSermonDetails] = useState({
        title: '',
        bibleVerse: '',
        targetAudience: '',
        sermonLength: 0,
    });
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const savedSermons = JSON.parse(localStorage.getItem('sermons') || '[]');
        setSermons(savedSermons);
    }, []);

    const handleGenerateSermon = async (prompt: {
        apiKey: string;
        sermonTopic: string;
        bibleVerse: string;
        sermonLength: number;
        targetAudience: string;
        sermon: string;
    }) => {
        setProgressLog((prev) => [...prev, '설교문 생성을 시작합니다.']);
        try {
            setSermon(prompt.sermon);
            setSermonDetails({
                title: prompt.sermonTopic,
                bibleVerse: prompt.bibleVerse,
                targetAudience: prompt.targetAudience,
                sermonLength: prompt.sermonLength,
            });

            const today = new Date();
            const formattedDate = `(${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()})`;
            const formattedFileName = `제목: ${prompt.sermonTopic} | 성경구절: ${prompt.bibleVerse} | 대상: ${prompt.targetAudience} | 분량: ${prompt.sermonLength}분 | 작성일: ${formattedDate}`;
            setFileName(formattedFileName);

            setProgressLog((prev) => [...prev, '설교문이 성공적으로 생성되었습니다.']);
        } catch (error) {
            setProgressLog((prev) => [...prev, '설교 생성 중 오류 발생.']);
        }
    };

    const handleEditSermon = () => {
        setIsEditing(true);
    };

    const handleSaveSermon = () => {
        const htmlContent = marked(sermon);
        const sanitizedHtml = DOMPurify.sanitize(htmlContent);
        setSermon(sanitizedHtml);
        setIsEditing(false);
    };

    const handleLoadSermon = (id: string) => {
        const loadedSermon = sermons.find(sermon => sermon.id === id);
        if (loadedSermon) {
            setSermon(loadedSermon.content);
            setSermonDetails({
                title: loadedSermon.title,
                bibleVerse: loadedSermon.bibleVerse,
                targetAudience: loadedSermon.targetAudience,
                sermonLength: loadedSermon.sermonLength,
            });
            setFileName(loadedSermon.title);
        }
    };

    const handleDeleteSermon = (id: string) => {
        const updated = sermons.filter(sermon => sermon.id !== id);
        setSermons(updated);
        localStorage.setItem('sermons', JSON.stringify(updated));
    };

    const handleSaveToJson = () => {
        const newSermon = {
            id: Date.now().toString(),
            content: sermon,
            title: fileName || '제목 없음',
            bibleVerse: sermonDetails.bibleVerse || '성경 구절 없음',
            targetAudience: sermonDetails.targetAudience || '대상 없음',
            sermonLength: sermonDetails.sermonLength || 0,
        };

        const existingSermonIndex = sermons.findIndex(sermon => sermon.title === newSermon.title);

        if (existingSermonIndex !== -1) {
            const updatedSermons = [...sermons];
            updatedSermons[existingSermonIndex] = newSermon;
            setSermons(updatedSermons);
            localStorage.setItem('sermons', JSON.stringify(updatedSermons));
        } else {
            setSermons((prevSermons) => [newSermon, ...prevSermons]);
            localStorage.setItem('sermons', JSON.stringify([newSermon, ...sermons]));
        }
    };

    const handlePrintSermon = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>설교 출력</title></head><body>');
            printWindow.document.write(`<h1>${sermonDetails.title}</h1>`);
            printWindow.document.write(`<div>${sermon}</div>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleSaveToWord = () => {
        const htmlContent = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${sermonDetails.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        h1 { text-align: center; }
                        p { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>${sermonDetails.title}</h1>
                    <p>${sermon}</p>
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleOpenHtmlHelp = () => {
        // 팝업 창 크기와 기능을 조정하여 HTML 도움말 파일을 열기
        window.open('/basic_html.html', '_blank', 'width=800,height=600,scrollbars=yes');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>설교문 작성</h1>

            {/* 프롬프트 입력 */}
            <div style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2>설교문 생성</h2>
                <PromptInputComponent onGenerateSermon={handleGenerateSermon} />
            </div>

            {/* 설교문 출력/수정 */}
            <div style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                {isEditing ? (
                    <textarea
                        value={sermon}
                        onChange={(e) => setSermon(e.target.value)}
                        rows={30}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <SermonOutputComponent sermon={sermon} />
                )}

                <div style={{ margin: '20px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={isEditing ? handleSaveSermon : handleEditSermon} style={{ marginRight: '10px' }}>
                        {isEditing ? '수정완료' : '수정하기'}
                    </button>
                    <button onClick={handlePrintSermon} style={{ marginRight: '10px' }}>출력하기</button>
                    <button onClick={handleSaveToWord} style={{ marginRight: '10px' }}>Word 저장</button>
                    <button onClick={handleOpenHtmlHelp} style={{ marginRight: '10px' }}>HTML문법</button>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="파일명 입력"
                            style={{ marginBottom: '0px', width: '650px', fontSize: '15px' }}
                        />
                        <button onClick={handleSaveToJson} style={{ marginLeft: '10px' }}>설교 저장</button>
                    </div>
                </div>
            </div>

            {/* 설교문 관리 (스크롤 가능한 리스트) */}
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2>설교문 관리</h2>
                <div
                    style={{
                        height: '150px',
                        overflowY: 'auto',
                        border: '1px solid #eee',
                        padding: '10px',
                        borderRadius: '8px',
                    }}
                >
                    {sermons.map((sermon) => (
                        <div
                            key={sermon.id}
                            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}
                        >
                            <span
                                onMouseEnter={(e) => (e.currentTarget.style.cursor = 'pointer')}
                                onClick={() => handleLoadSermon(sermon.id)}
                                style={{ textDecoration: 'underline', color: 'blue' }}
                            >
                                {sermon.title}
                            </span>
                            <button onClick={() => handleDeleteSermon(sermon.id)}>삭제</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;