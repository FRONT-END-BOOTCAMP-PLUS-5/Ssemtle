import SidebarUser from '../_components/sidebar/SidebarUser';
import SidebarAdmin from '../_components/sidebar/SidebarAdmin';
import SidebarTeacher from '../_components/sidebar/SidebarTeacher';

const UnitExamPage = () => {
  return (
    <div className="flex">
      <SidebarAdmin></SidebarAdmin>
      <SidebarTeacher></SidebarTeacher>
      <SidebarUser></SidebarUser>
    </div>
  );
};

export default UnitExamPage;
