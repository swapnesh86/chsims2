//import { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Public from './components/Public';
import Login from './features/auth/Login';
import DashLayout from './components/DashLayout';
import Welcome from './features/auth/Welcome';
import SearchSkuList from './features/skus/SearchSkuList';
import NewSku from './features/skus/NewSku';
import UsersList from './features/users/UsersList';
import EditUser from './features/users/EditUser';
import NewUserForm from './features/users/NewUserForm';
import LedgerList from './features/ledger/LedgerList';
import InventoryList from './features/inventory/InventoryList';
import BillList from './features/transfers/BillList';
import MembershipList from './features/membership/MembershipList';
import NewMemberForm from './features/membership/NewMemberForm';

import Prefetch from './features/auth/Prefetch';
import PersistLogin from './features/auth/PersistLogin';
import { ROLES } from './config/roles';
import RequireAuth from './features/auth/RequireAuth';
import useTitle from './hooks/useTitle';

function App() {
  useTitle('Creative Handicrafts')

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />

        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}>
            <Route element={<Prefetch />}>
              <Route path="dash" element={<DashLayout />}>
                <Route index element={<Welcome />} />
                <Route path="skus">
                  <Route index element={<SearchSkuList />} />
                  <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.SkuManager]} />}>
                    <Route path="new" element={<NewSku />} />
                  </Route>
                </Route>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path=":id" element={<EditUser />} />
                    <Route path="new" element={<NewUserForm />} />
                  </Route>
                </Route>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.ShopManager, ROLES.AdInCharge, ROLES.PoInCharge, ROLES.BaInCharge]} />}>
                  <Route path="ledger">
                    {/* <Route index element={<LedgerList />} /> */}
                    <Route path=":id" element={<LedgerList />} />
                  </Route>
                </Route>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.ShopManager, ROLES.AdInCharge, ROLES.PoInCharge, ROLES.BaInCharge, ROLES.InventoryManager]} />}>
                  <Route path="inventory">
                    <Route index element={<InventoryList />} />
                  </Route>
                </Route>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.ShopManager, ROLES.AdInCharge, ROLES.PoInCharge, ROLES.BaInCharge]} />}>
                  <Route path="billing">
                    <Route index element={<BillList />} />
                  </Route>
                </Route>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.ShopManager, ROLES.AdInCharge, ROLES.PoInCharge, ROLES.BaInCharge]} />}>
                  <Route path="membership">
                    <Route index element={<MembershipList />} />
                    <Route path="new" element={<NewMemberForm />} />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>

      </Route>
    </Routes>

  );
}

export default App;
