import React from 'react';

interface SermonStorageProps {
    sermons: any[]; // 적절한 타입으로 변경
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
}

const SermonStorageComponent: React.FC<SermonStorageProps> = ({ sermons, onLoad, onDelete }) => {
    return (
        <div>
            <ul>
                {sermons.map((sermon) => (
                    <li key={sermon.id}>
                        <span onClick={() => onLoad(sermon.id)}>{sermon.title}</span>
                        <button onClick={() => onDelete(sermon.id)}>삭제</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SermonStorageComponent;
