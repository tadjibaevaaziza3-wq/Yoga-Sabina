import {
    List,
    Datagrid,
    TextField,
    NumberField,
    FunctionField,
    SearchInput,
    SelectInput,
    ShowButton,
    EditButton,
    ImageField
} from 'react-admin';
import { Chip } from '@mui/material';

const courseFilters = [
    <SearchInput source="q" alwaysOn key="search" />,
    <SelectInput source="type" label="Turi" choices={[
        { id: 'ONLINE', name: 'Onlayn' },
        { id: 'OFFLINE', name: 'Oflayn' },
    ]} key="type" />,
];

export const CourseList = () => (
    <List
        filters={courseFilters}
        sort={{ field: 'createdAt', order: 'DESC' }}
        sx={{
            '& .RaList-main': {
                backgroundColor: 'background.paper',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <ImageField source="coverImage" label="Rasm" sx={{ '& img': { width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' } }} />
            <TextField source="title" label="Sarlavha (UZ)" />
            <FunctionField label="" render={(r: any) => r?.isBestseller ? <Chip label="⭐ Bestseller" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.7rem' }} /> : null} />
            <TextField source="type" label="Turi" />
            <NumberField source="price" label="Narx" options={{ style: 'currency', currency: 'UZS' }} />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);
