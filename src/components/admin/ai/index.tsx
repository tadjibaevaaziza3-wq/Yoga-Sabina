import { List, Datagrid, TextField, EditButton, Edit, Create, SimpleForm, TextInput, SelectInput, BooleanInput, BooleanField } from 'react-admin';
import { Box } from '@mui/material';

export const AiTrainingList = () => (
    <List>
        <Datagrid rowClick="edit" >
            <TextField source="title" label="Sarlavha" />
            <TextField source="type" label="Turi" />
            <BooleanField source="isActive" label="Faol" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

const AiTrainingForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '900px' }}>
        <TextInput source="title" label="Sarlavha" isRequired fullWidth />
        <SelectInput source="type" label="Turi" choices={
            [
                { id: 'SYSTEM_PROMPT', name: 'Tizim prompti' },
                { id: 'KNOWLEDGE_DOC', name: "Bilim hujjati" },
                { id: 'RULE', name: "Qoida" },
            ]} isRequired />
        <TextInput source="content" label="Kontent" isRequired fullWidth multiline minRows={10} helperText="AI foydalanadigan matn/kontekst." />
        <BooleanInput source="isActive" label="Faol" />
    </Box>
);

export const AiTrainingEdit = () => (
    <Edit>
        <SimpleForm>
            <AiTrainingForm />
        </SimpleForm>
    </Edit>
);

export const AiTrainingCreate = () => (
    <Create>
        <SimpleForm>
            <AiTrainingForm />
        </SimpleForm>
    </Create>
);

export default {
    list: AiTrainingList,
    edit: AiTrainingEdit,
    create: AiTrainingCreate,
};
