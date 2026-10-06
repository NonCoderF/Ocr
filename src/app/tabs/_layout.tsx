import {NativeTabs} from 'expo-router/unstable-native-tabs';

const TabsApp = () => {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="camera">
                <NativeTabs.Trigger.Label>Camera</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="camera.fill" md="camera_alt"/>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="gallery">
                <NativeTabs.Trigger.Label>Gallery</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="photo.on.rectangle" md="photo_library"/>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
};

export default TabsApp;
