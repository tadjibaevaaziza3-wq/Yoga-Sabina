import { List, Datagrid, TextField, EditButton, Edit, SimpleForm, TextInput, SelectInput } from 'react-admin';
import { Box } from '@mui/material';

export const AppContentList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="key" label="Kalit" />
            <TextField source="type" label="Turi" />
            <TextField source="description" label="Tavsif" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

export const AppContentEdit = () => (
    <Edit>
        <SimpleForm>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '800px' }}>
                <TextInput source="key" label="Kalit" disabled aria-readonly />
                <SelectInput source="type" label="Turi" choices={[
                    { id: 'TEXT', name: 'Matn' },
                    { id: 'IMAGE', name: 'Rasm' },
                    { id: 'VIDEO', name: 'Video' },
                    { id: 'JSON', name: 'JSON' },
                ]} disabled aria-readonly />
                <TextInput source="description" label="Tavsif" fullWidth multiline />
                <TextInput source="value" label="Qiymat" fullWidth multiline minRows={5} helperText="Matn yoki JSON qiymatlari" />
                <TextInput source="mediaUrl" label="Media URL" fullWidth helperText="Media URL manzili" />
            </Box>
        </SimpleForm>
    </Edit>
);
