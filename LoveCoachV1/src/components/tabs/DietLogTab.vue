<script setup>
import { ref } from 'vue'

// Current date
const currentDate = ref(new Date().toISOString().split('T')[0])

// Meal type selector
const selectedMealType = ref('breakfast')
const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'lunch', name: 'Lunch', icon: '☀️' },
  { id: 'dinner', name: 'Dinner', icon: '🌙' },
  { id: 'snack', name: 'Snacks', icon: '🍪' }
]

// Daily totals (mock data)
const dailyGoal = 2000
const currentCalories = 1520

// Food items (mock data)
const foodItems = ref([
  { name: 'Rice Bowl', calories: 300, protein: 5, carbs: 65, fat: 2 },
  { name: 'Grilled Chicken', calories: 250, protein: 42, carbs: 0, fat: 8 },
  { name: 'Mixed Salad', calories: 120, protein: 3, carbs: 15, fat: 6 },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 }
])

const addFood = () => {
  console.log('Add food dialog')
}
</script>

<template>
  <div class="diet-log-tab">
    <!-- Header with Date -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-soft-black">Diet Log</h2>
      <input 
        type="date" 
        v-model="currentDate"
        class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pastel-red focus:outline-none transition-colors"
      />
    </div>

    <!-- Daily Goal Progress -->
    <div class="bg-gradient-to-r from-pastel-red/10 to-pastel-yellow/10 rounded-2xl p-6 mb-8 border border-pastel-red/20">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-2xl font-bold text-soft-black">Today's Goal</h3>
          <p class="text-gray-600">{{ currentCalories }} / {{ dailyGoal }} kcal</p>
        </div>
        <div class="text-5xl font-bold text-pastel-red">
          {{ Math.round((currentCalories / dailyGoal) * 100) }}%
        </div>
      </div>
      <!-- Progress bar -->
      <div class="w-full bg-white/60 h-4 rounded-full overflow-hidden shadow-inner">
        <div 
          class="h-full bg-gradient-to-r from-pastel-red to-pastel-yellow rounded-full transition-all duration-700"
          :style="{ width: `${(currentCalories / dailyGoal) * 100}%` }"
        ></div>
      </div>
      <!-- Macro breakdown -->
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="bg-white/80 rounded-xl p-3 text-center">
          <p class="text-xs text-gray-500 mb-1">Protein</p>
          <p class="text-lg font-bold text-pastel-red">50g</p>
        </div>
        <div class="bg-white/80 rounded-xl p-3 text-center">
          <p class="text-xs text-gray-500 mb-1">Carbs</p>
          <p class="text-lg font-bold text-pastel-yellow">105g</p>
        </div>
        <div class="bg-white/80 rounded-xl p-3 text-center">
          <p class="text-xs text-gray-500 mb-1">Fat</p>
          <p class="text-lg font-bold text-pastel-blue">16g</p>
        </div>
      </div>
    </div>

    <!-- Meal Type Selector -->
    <div class="flex gap-3 mb-6">
      <button
        v-for="meal in mealTypes"
        :key="meal.id"
        class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 border-2"
        :class="selectedMealType === meal.id 
          ? 'bg-pastel-red text-white border-pastel-red shadow-md transform scale-105' 
          : 'bg-white text-gray-600 border-gray-200 hover:border-pastel-red/50'"
        @click="selectedMealType = meal.id"
      >
        <span class="mr-2">{{ meal.icon }}</span>
        {{ meal.name }}
      </button>
    </div>

    <!-- Food List -->
    <div class="space-y-3 mb-6">
      <div
        v-for="(food, index) in foodItems"
        :key="index"
        class="bg-white rounded-xl p-4 border border-gray-100 hover:border-pastel-red/30 hover:shadow-md transition-all duration-300 flex justify-between items-center group"
      >
        <div class="flex-1">
          <h4 class="font-bold text-soft-black mb-1">{{ food.name }}</h4>
          <div class="flex gap-4 text-xs text-gray-500">
            <span>🔥 {{ food.calories }} kcal</span>
            <span>🥩 {{ food.protein }}g</span>
            <span>🍚 {{ food.carbs }}g</span>
            <span>🧈 {{ food.fat }}g</span>
          </div>
        </div>
        <button class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 text-sm font-semibold">
          Remove
        </button>
      </div>
    </div>

    <!-- Add Food Button -->
    <button
      @click="addFood"
      class="w-full py-4 bg-gradient-to-r from-pastel-red to-pastel-yellow text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
    >
      ➕ Add Food
    </button>
  </div>
</template>

<style scoped>
.diet-log-tab {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
