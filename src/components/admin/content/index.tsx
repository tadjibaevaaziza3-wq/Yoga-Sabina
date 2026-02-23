import { AppContentList, AppContentEdit } from './AppContentCMS';
import { Create, SimpleForm, TextInput, SelectInput } from 'react-admin';
import { Box } from '@mui/material';

export const AppContentCreate = () => (
    <Create>
        <SimpleForm>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '800px' }}>
                <TextInput source="key" label="Kalit" isRequired />
                <SelectInput source="type" label="Turi" choices={
                    [
                        { id: 'TEXT', name: 'Matn' },
                        { id: 'IMAGE', name: 'Rasm' },
                        { id: 'VIDEO', name: 'Video' },
                        { id: 'JSON', name: 'JSON' },
                    ]} isRequired />
                <TextInput source="description" label="Tavsif" fullWidth multiline />
                <TextInput source="value" label="Qiymat" fullWidth multiline minRows={5} helperText="Matn yoki JSON qiymatlari" />
                <TextInput source="mediaUrl" label="Media URL" fullWidth helperText="Media URL manzili" />
            </Box>
        </SimpleForm>
    </Create>
);

export default {
    list: AppContentList,
    edit: AppContentEdit,
    create: AppContentCreate,
};
