// src/components/PromptInput.tsx
import React, { useState, useEffect } from 'react';
import { saveAPIKey, loadAPIKey } from '../utils/api';
import axios, { AxiosError } from 'axios';
import { marked } from 'marked';

interface PromptInputProps {
    onGenerateSermon: (prompt: {
        apiKey: string;
        sermonTopic: string;
        bibleVerse: string;
        sermonLength: number;
        targetAudience: string;
        sermon: string;
        gptModel: string;
    }) => void;
}

const PromptInputComponent: React.FC<PromptInputProps> = ({ onGenerateSermon }) => {
    const [apiKey, setApiKey] = useState('');
    const [sermonTopic, setSermonTopic] = useState('');
    const [bibleVerse, setBibleVerse] = useState('');
    const [sermonLength, setSermonLength] = useState(10);
    const [targetAudience, setTargetAudience] = useState('성도');
    const [selectedOption, setSelectedOption] = useState<'topic' | 'verse'>('topic');
    const [loading, setLoading] = useState(false);
    const [errorLog, setErrorLog] = useState<string[]>([]);
    const [progressLog, setProgressLog] = useState<string[]>([]);
    const [gptModel, setGptModel] = useState('gpt-4.1-mini');

    useEffect(() => {
        const key = loadAPIKey();
        if (key) {
            setApiKey(key);
        }
    }, []);

    const handleSaveAPIKey = () => {
        saveAPIKey(apiKey); 
        setProgressLog((prev) => [...prev, 'API 키가 저장되었습니다.']);
    };

    const handleGenerateSermon = async () => {
        setLoading(true);
        setErrorLog([]);
        setProgressLog([]);

        const prompt = `
당신은 성경 말씀에 능통하고 신학적 지식이 풍부한 설교자로 행동합니다.
반드시 성도들에게 익숙한 개역개정 성경 구절과 설교 주제(제목)을 선택하고, 신학적 논리적으로 작성.
하나님의 말씀을 정확하게 전달하는 것을 목표로 설교 대상에 적합하게 최고의 설교문을 작성해주세요.
${selectedOption === 'topic' ? `설교 주제: ${sermonTopic}` : `성경 구절: ${bibleVerse}`}
설교 분량:${sermonLength}분
설교 대상: ${targetAudience}

설교문은 다음 내용들을 반드시 포함하여 작성해 주세요.
[지시] 설교문 내용은 반드시 마크다운 텍스트 방식으로 세련된 HTML 스타일로 출력
- <html>, <head>, <body> 같은 전체 HTML 문서 구조는 포함하지 마세요.
- 반드시 마크다운 형식으로만 작성해 주세요.
[제한] 반드시 설교 내용은 ${sermonLength}에 500을 곱한 글자 수 이상을 설교할 수 있는 분량이어야 합니다.

설교문은 다음 내용들을 반드시 포함하여 작성해 주세요.
1. 톤과 스타일  
- 지나치게 어렵지 않은 일상적인 언어를 사용해 주세요.  
- 마치 목회자가 직접 말하는 것처럼 구어체로 작성해 주세요.  
- 따뜻하고 공감되는 어조로, 부드럽게 도전을 주는 설교 스타일이면 좋습니다.  
- 필요한 경우, 짧은 반복이나 간결한 문장으로 청중의 집중력을 높여 주세요.

2. 설교 구조  
아래와 같은 3단 구조로 자연스럽게 흐름을 구성해 주세요:
1) 서론:  
  - 본문과 주제를 자연스럽게 연결하며 설교의 분위기를 잡아 주세요.  
  - 청중이 집중할 수 있도록 흥미로운 질문, 짧은 이야기, 상황 묘사 등을 활용해 주세요.
  - 성경 본문의 역사적, 문화적, 신학적, 시대적 상황(고난, 포로, 방황, 회복 등)을 오늘날의 한국 현실과 연결지어 주세요.
    예: 경제적 어려움, 가정 해체, 영적 침체 등
2) 본론:  
  - 말씀의 의미를 정확히 설명하면서, 청중이 이해하기 쉽게 해석해 주세요.  
  - 하나님의 성품과 메시지 파악하여 성도들에게 하나님이 어떤 분이신지를 경험하게 해야 합니다.
  - 복음 중심으로 해석하며 구약 성경도 예수님의 십자가와 부활로 연결되어져야 합니다.
  - 사람의 상태와 문제 인식을 다루어야 합니다. (예:무기력, 두려움, 교만, 타성에 젖은 신앙)
  - 반드시 한국적 공감 요소 포함하여 성도들이 '아, 내 이야기 같다'고 느낄 수 있도록 하세요.
    (예:가족, 직장, 교회, 병원, 경제 문제, 자녀 교육 등)
  - 중심 메시지를 2~3개의 핵심 포인트로 나누어 풀어 주세요.  
  - 각 포인트마다 구체적인 설명, 예화, 적용점이 포함되도록 해 주세요.
  2-1) 예화 
    - 예화는 꼭 본문과 연결된 메시지와 관련성이 있도록 해 주세요.  
    - 일상 속의 짧고 공감가는 에피소드나 성경 속 인물의 이야기를 1~2개 정도 포함해 주세요.  
    - 한국인 정서는 이야기에 깊이 반응하므로 짧고 간결하면서도 '감정 이입이 가능한 예화'를 사용하세요.
    - 예화 후 반드시 이 예화를 통해 우리가 무엇을 배울 수 있는가? 라는 해석과 적용이 따라오게 해 주세요.
  2-2) 적용  
    - 구절의 본문을 현대적인 삶에 어떻게 적용할 수 있을지에 대해 구체적으로 다뤄주세요. 
    - 말씀을 일상 속에서 살아낼 수 있도록 청중의 삶에 맞는 구체적이고 실천 가능한 적용'을 2가지 정도 제시해 주세요.  
    - 예: "이번 주에 내가 빛이 되어줄 수 있는 한 사람을 위해 기도하고, 먼저 인사해 보세요."
3) 결론:  
  - 설교 내용을 간결히 정리해 주세요.  
  - 마지막으로 핵심 메시지 명확하게 정리하여 한 문장으로 요약해야 합니다.
  - 성도들이 한 주간 살아가는데 필요한 핵심 문장 제시해 주세요. 
  - 성도들이 설교 말씀을 붙들고 살아갈 수 있도록 구체적인 적용점을 제시해 주세요.  

3. 설교 기도문
  - 설교 내용을 바탕으로 회개, 헌신, 회복, 감사의 기도를 포함하세요.

4. 찬양
 - 가능하면 설교 내용과 부합하는 "한국인들"이 즐겨 부르는 찬양곡 3곡 추천 `;

        setProgressLog((prev) => [...prev, '프롬프트를 작성합니다.']);

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: gptModel,
                messages: [
                    { role: 'user', content: prompt }
                ],
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            });

            const sermonContent = response.data.choices[0].message.content;
            const convertedHtml = marked(sermonContent);

            if (typeof convertedHtml === 'string') {
                onGenerateSermon({
                    apiKey,
                    sermonTopic,
                    bibleVerse,
                    sermonLength,
                    targetAudience,
                    sermon: convertedHtml,
                    gptModel,
                });
            } else {
                setErrorLog((prev) => [...prev, '설교문 변환 중 오류가 발생했습니다.']);
            }

            setProgressLog((prev) => [...prev, '설교문이 성공적으로 생성되었습니다.']);
        } catch (error) {
            const axiosError = error as AxiosError;
            const errorMessage: string = (axiosError.response?.data as string) || '설교문 생성 중 오류가 발생했습니다.';
            setErrorLog((prev: string[]) => [...prev, 'API 요청 중 오류 발생: ' + errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px' }}>API Key:</span>
                    <input
                        type="password"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ width: '700px', marginRight: '10px', fontSize: '15px' }}
                    />
                    <button onClick={handleSaveAPIKey}>API Key 저장</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px' }}>모델:</span>
                    <select
                        value={gptModel}
                        onChange={(e) => setGptModel(e.target.value)}
                        style={{ fontSize: '15px' }}
                    >
                        <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        <option value="gpt-4.1">gpt-4.1</option>
                        <option value="gpt-4o">gpt-4o</option>
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ marginRight: '10px' }}>
                            <input
                                type="radio"
                                name="topicOrVerse"
                                value="topic"
                                checked={selectedOption === 'topic'}
                                onChange={() => {
                                    setSelectedOption('topic');
                                    setBibleVerse('');
                                }}
                            />
                            설교주제
                        </label>
                        <label style={{ marginRight: '10px' }}>
                            <input
                                type="radio"
                                name="topicOrVerse"
                                value="verse"
                                checked={selectedOption === 'verse'}
                                onChange={() => {
                                    setSelectedOption('verse');
                                    setSermonTopic('');
                                }}
                            />
                            성경구절
                        </label>
                        <input
                            type="text"
                            placeholder={selectedOption === 'topic' ? "설교주제를 입력해 주세요." : "성경구절을 입력해 주세요."}
                            value={selectedOption === 'topic' ? sermonTopic : bibleVerse}
                            onChange={(e) => {
                                if (selectedOption === 'topic') {
                                    setSermonTopic(e.target.value);
                                } else {
                                    setBibleVerse(e.target.value);
                                }
                            }}
                            style={{ width: '350px', marginLeft: '10px', fontSize: '15px' }}
                        />
                        <label style={{ marginLeft: '30px', marginRight: '10px' }}>분량(분):</label>
                        <input
                            type="number"
                            value={sermonLength}
                            onChange={(e) => setSermonLength(Number(e.target.value))}
                            style={{ width: '50px', marginRight: '30px', fontSize: '15px' }}
                        />
                        <span>대상:</span>
                        <select
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            style={{ marginLeft: '10px', fontSize: '15px' }}
                        >
                            <option value="성도">성도</option>
                            <option value="유아">유아</option>
                            <option value="어린이">어린이</option>
                            <option value="청소년">청소년</option>
                            <option value="청년">청년</option>
                            <option value="중년">중년</option>
                            <option value="장년">장년</option>
                            <option value="노년">노년</option>
                            <option value="어린이 성경학교">어린이 성경학교</option>
                            <option value="청소년 수련회">청소년 수련회</option>
                            <option value="새신자">새신자</option>
                            <option value="부흥회">부흥회</option>
                        </select>
                        <button onClick={handleGenerateSermon} disabled={loading} style={{ marginLeft: '30px' }}>
                            {loading ? "생성중..." : "설교문 생성"}
                        </button>
                    </div>
                </div>
            </div>

            {errorLog.length > 0 && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    <h4>에러 로그:</h4>
                    {errorLog.map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromptInputComponent;
