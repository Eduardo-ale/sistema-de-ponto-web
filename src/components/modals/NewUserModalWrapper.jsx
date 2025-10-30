import React, { useState } from 'react';
import NewUserModal from './NewUserModal';
import { useUsers } from '../../hooks/useRealData';

// Componente isolado para o modal de novo usuário
const NewUserModalWrapper = ({ isModalOpen, handleClose }) => {
    const [isOpen, setIsOpen] = useState(isModalOpen);
    const { actions: usersActions } = useUsers();

    // Sincronizar com o estado externo
    React.useEffect(() => {
        setIsOpen(isModalOpen);
    }, [isModalOpen]);

    const handleCloseModal = () => {
        setIsOpen(false);
        handleClose();
    };

    const handleUserCreated = async (newUser) => {
        try {
            const result = await usersActions.createUser(newUser);
            if (result.success) {
                console.log('Novo usuário criado:', newUser);
                // A lista será atualizada automaticamente pelo React Query
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
        }
    };

    return (
        <NewUserModal
            isOpen={isOpen}
            onClose={handleCloseModal}
            onUserCreated={handleUserCreated}
        />
    );
};

export default NewUserModalWrapper;
