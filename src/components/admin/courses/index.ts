import { CourseList } from './CourseList';
import { CourseEdit } from './CourseEdit';
import { CourseShow } from './CourseShow';
import { CourseCreate } from './CourseCreate';
import ClassIcon from '@mui/icons-material/Class';

export default {
    list: CourseList,
    edit: CourseEdit,
    show: CourseShow,
    create: CourseCreate,
    icon: ClassIcon,
    options: { label: 'Kurslar' }
};
