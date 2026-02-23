"use client";

import {
    Create, TextInput, NumberInput, SelectInput, TabbedForm, FormTab
} from 'react-admin';
import { GcsImageInput } from '../inputs/GcsImageInput';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';

export const CourseCreate = () => (
    <Create title={<span>Yangi kurs yaratish</span>} redirect="show">
        <TabbedForm sx={{
            '& .RaTabbedForm-content': {
                backgroundColor: 'background.paper', borderRadius: '0 0 14px 14px',
                padding: '24px', boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)', mt: 0
            },
            '& .MuiTabs-root': {
                backgroundColor: 'background.paper', borderRadius: '14px 14px 0 0',
                borderBottom: '1px solid rgba(17, 69, 57, 0.08)', px: 2, pt: 1
            }
        }}>
            <FormTab label="Asosiy">
                <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Sarlavha (UZ)" labelRu="Sarlavha (RU)" />
                <TranslatableTextInput sourceUz="description" sourceRu="descriptionRu" labelUz="Tavsif (UZ)" labelRu="Tavsif (RU)" multiline rows={4} />
                <SelectInput source="type" label="Turi" choices={[
                    { id: 'ONLINE', name: 'Onlayn' },
                    { id: 'OFFLINE', name: 'Oflayn' },
                ]} fullWidth defaultValue="ONLINE" />
                <GcsImageInput source="coverImage" label="Muqova rasmi" bucket="assets" pathPrefix="courses/covers" />
            </FormTab>
            <FormTab label="Narx va sozlamalar">
                <NumberInput source="price" fullWidth label="Narx (UZS)" defaultValue={0} />
                <NumberInput source="durationDays" fullWidth label="Kirish muddati (kun)" helperText="Cheksiz kirish uchun bo'sh qoldiring" />
                <NumberInput source="videoLimit" fullWidth label="Video chegarasi" />
                <SelectInput source="productType" label="Mahsulot turi" choices={[
                    { id: 'COURSE', name: 'Kurs' },
                    { id: 'CONSULTATION', name: 'Konsultatsiya' },
                ]} fullWidth defaultValue="COURSE" />
                <SelectInput source="targetAudience" label="Maqsadli auditoriya" choices={[
                    { id: 'ALL', name: 'Hammasi' },
                    { id: 'MEN', name: 'Erkaklar' },
                    { id: 'WOMEN', name: 'Ayollar' },
                ]} fullWidth defaultValue="ALL" />
            </FormTab>
            <FormTab label="SEO">
                <TextInput source="seoTitle" fullWidth label="SEO sarlavha" />
                <TextInput source="seoDescription" fullWidth multiline rows={3} label="SEO tavsif" />
                <TextInput source="seoKeywords" fullWidth label="SEO kalit so'zlar" helperText="Vergul bilan ajrating" />
            </FormTab>
        </TabbedForm>
    </Create>
);
