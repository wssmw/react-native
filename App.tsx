import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'vaul';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="bg-black/40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-3xl mt-24 border border-gray-200">
            <Drawer.Header className="flex flex-col gap-y-2">
              <Drawer.Title className="text-2xl font-medium text-gray-900">
                Title
              </Drawer.Title>
              <Drawer.Description className="text-sm text-gray-500">
                Description
              </Drawer.Description>
            </Drawer.Header>
            <div className="p-4 flex-1">
              <p className="text-base text-gray-700">
                This is the content of the drawer.
              </p>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </GestureHandlerRootView>
  );
}
