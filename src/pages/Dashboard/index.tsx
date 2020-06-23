import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  console.log(foods);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      api.get<IFoodPlate[]>('foods').then(response => {
        setFoods(response.data);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      api
        .post('foods', {
          ...food,
          available: true,
        })
        .then(response => {
          setFoods(state => [...state, response.data]);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { id, available } = editingFood;

    api
      .put(`foods/${id}`, {
        id,
        available,
        ...food,
      })
      .then(() => {
        setFoods(state => {
          const foodIndex = state.findIndex(
            findFood => findFood.id === editingFood.id,
          );

          const data = [...state];

          if (foodIndex >= 0) {
            data[foodIndex] = {
              ...editingFood,
              ...food,
            };
          }

          return data;
        });
      });

    setEditingFood({} as IFoodPlate);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    api.delete(`foods/${id}`).then(() => {
      setFoods(state => {
        const foodIndex = state.findIndex(food => food.id === id);

        const data = [...state];

        if (foodIndex >= 0) {
          data.splice(foodIndex, 1);
        }

        return data;
      });
    });
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
