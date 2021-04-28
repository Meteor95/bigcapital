import React, { lazy } from 'react';
import { Drawer, DrawerSuspense } from 'components';
import withDrawers from 'containers/Drawer/withDrawers';

import { compose } from 'utils';

const AccountDrawerContent = lazy(() => import('./AccountDrawerContent'));

/**
 * Account drawer.
 */
function AccountDrawer({
  name,
  //#withDrawer
  isOpen,
  payload: { accountId },
}) {

  return (
    <Drawer isOpen={isOpen} name={name}>
      <DrawerSuspense>
        <AccountDrawerContent accountId={accountId} />
      </DrawerSuspense>
    </Drawer>
  );
}

export default compose(withDrawers())(AccountDrawer);
