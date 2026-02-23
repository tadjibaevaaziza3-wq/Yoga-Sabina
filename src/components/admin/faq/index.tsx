"use client";

import { List, Datagrid, TextField, EditButton, Edit, Create, SimpleForm, NumberInput, NumberField } from 'react-admin';
import { Box } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';

export const FAQList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="question" label="Savol" />
            <NumberField source="order" label="Tartib" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

const FAQForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <TranslatableTextInput sourceUz="question" sourceRu="questionRu" labelUz="Savol (UZ)" labelRu="Savol (RU)" required />
        <TranslatableTextInput sourceUz="answer" sourceRu="answerRu" labelUz="Javob (UZ)" labelRu="Javob (RU)" multiline minRows={4} required />
        <NumberInput source="order" label="Tartib raqami" defaultValue={0} />
    </Box>
);

export const FAQEdit = () => (
    <Edit>
        <SimpleForm>
            <FAQForm />
        </SimpleForm>
    </Edit>
);

export const FAQCreate = () => (
    <Create>
        <SimpleForm>
            <FAQForm />
        </SimpleForm>
    </Create>
);

export default {
    list: FAQList,
    edit: FAQEdit,
    create: FAQCreate,
};
