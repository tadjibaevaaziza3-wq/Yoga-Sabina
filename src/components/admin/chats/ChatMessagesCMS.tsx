"use client";

import { List, Datagrid, TextField, ReferenceField, DateField, ShowButton, Show, SimpleShowLayout } from 'react-admin';

export const ChatMessageList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" label="ID" />
            <ReferenceField source="userId" reference="users" label="Foydalanuvchi">
                <TextField source="email" />
            </ReferenceField>
            <ReferenceField source="courseId" reference="courses" label="Kurs" emptyText="—">
                <TextField source="title" />
            </ReferenceField>
            <TextField source="message" label="Xabar" />
            <DateField source="createdAt" label="Sana" showTime />
            <ShowButton label="Ko'rish" />
        </Datagrid>
    </List>
);

export const ChatMessageShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="ID" />
            <ReferenceField source="userId" reference="users" label="Foydalanuvchi">
                <TextField source="email" />
            </ReferenceField>
            <ReferenceField source="courseId" reference="courses" label="Kurs" emptyText="—">
                <TextField source="title" />
            </ReferenceField>
            <TextField source="message" label="Xabar" />
            <DateField source="createdAt" label="Sana" showTime />
        </SimpleShowLayout>
    </Show>
);

export default {
    list: ChatMessageList,
    show: ChatMessageShow,
};
