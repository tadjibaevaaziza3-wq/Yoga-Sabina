import React from 'react';

type StructuredDataProps = {
    data: Record<string, any>;
    id?: string;
};

export function StructuredData({ data, id = 'ld-json' }: StructuredDataProps) {
    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
