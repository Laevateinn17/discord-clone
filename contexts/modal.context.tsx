import ChannelSettingsPage from "@/components/channel-settings-page/channel-settings-page";
import { CreateCategoryModal } from "@/components/modals/create-category-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { CreateGuildModal } from "@/components/modals/create-guild-modal";
import { CreateInviteModal } from "@/components/modals/create-invite-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import SettingsPage from "@/components/settings-page/settings-page";
import { ModalType } from "@/enums/modal-type.enum";
import { createContext, ReactNode, useContext, useState } from "react";

interface ModalMetadata {
    type: ModalType | null;
    data?: any;
}

interface ModalContextType {
    openModal: (type: ModalType, data?: any) => void;
    closeModal: (type?: ModalType) => void;
    modal: ModalMetadata
}

const ModalContext = createContext<ModalContextType>(null!);

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalMetadata>({ type: null });
    const [channelSettingsModal, setChannelSettingsModal] = useState<ModalMetadata>({ type: null });

    function openModal(type: ModalType, data?: any) {
        if (type === ModalType.CHANNEL_SETTINGS) setChannelSettingsModal({ type, data });
        else setModal({ type, data });
    }

    function closeModal(type?: ModalType) {
        if (type === ModalType.CHANNEL_SETTINGS) setChannelSettingsModal({ type: null });
        else setModal({ type: null });
    }

    return (
        <ModalContext.Provider value={{ openModal, closeModal, modal }}>
            {children}
            {modal.type === ModalType.CREATE_CHANNEL && <CreateChannelModal guildId={modal.data.guildId} category={modal.data.category} onClose={closeModal} />}
            {modal.type === ModalType.CREATE_GUILD && <CreateGuildModal onClose={closeModal} />}
            {modal.type === ModalType.CREATE_CATEGORY && <CreateCategoryModal guildId={modal.data.guildId} onClose={closeModal} />}
            {modal.type === ModalType.DELETE_CHANNEL && <DeleteChannelModal channel={modal.data.channel} onClose={closeModal} />}
            {modal.type === ModalType.CREATE_INVITE && <CreateInviteModal guildId={modal.data.guildId} channelId={modal.data.channelId} onClose={closeModal}/>}
            <SettingsPage show={modal.type === ModalType.SETTINGS} onClose={closeModal} />
            <ChannelSettingsPage channelId={channelSettingsModal.data?.channelId} guildId={channelSettingsModal.data?.guildId} show={channelSettingsModal.type === ModalType.CHANNEL_SETTINGS} onClose={() => closeModal(ModalType.CHANNEL_SETTINGS)} />
        </ModalContext.Provider>
    );
}