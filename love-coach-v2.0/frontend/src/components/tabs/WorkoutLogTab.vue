<script setup>
import { ref } from 'vue'

// Current date
const currentDate = ref(new Date().toISOString().split('T')[0])

// Current workout
const currentWorkout = ref('Chest Day')

// Exercise list (mock data)
const exercises = ref([
  {
    name: 'Bench Press',
    sets: [
      { weight: 60, reps: 10, completed: true },
      { weight: 65, reps: 8, completed: true },
      { weight: 65, reps: 8, completed: false }
    ]
  },
  {
    name: 'Incline Dumbbell Press',
    sets: [
      { weight: 25, reps: 12, completed: true },
      { weight: 25, reps: 10, completed: false }
    ]
  }
])

const addExercise = () => {
  console.log('Add exercise dialog')
}

const addSet = (exerciseIndex) => {
  exercises.value[exerciseIndex].sets.push({ weight: 0, reps: 0, completed: false })
}

const toggleSetCompletion = (exerciseIndex, setIndex) => {
  exercises.value[exerciseIndex].sets[setIndex].completed = !exercises.value[exerciseIndex].sets[setIndex].completed
}
</script>

<template>
  <div class="workout-log-tab">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-3xl font-bold text-soft-black mb-2">Workout Log</h2>
        <p class="text-gray-500">Current Workout: <span class="font-bold text-pastel-yellow">{{ currentWorkout }}</span></p>
      </div>
      <input 
        type="date" 
        v-model="currentDate"
        class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pastel-yellow focus:outline-none transition-colors"
      />
    </div>

    <!-- Workout Summary -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-gradient-to-br from-pastel-yellow/20 to-pastel-yellow/5 rounded-xl p-5 border border-pastel-yellow/30">
        <p class="text-sm text-gray-600 mb-1">Total Exercises</p>
        <p class="text-3xl font-bold text-soft-black">{{ exercises.length }}</p>
      </div>
      <div class="bg-gradient-to-br from-pastel-yellow/20 to-pastel-yellow/5 rounded-xl p-5 border border-pastel-yellow/30">
        <p class="text-sm text-gray-600 mb-1">Total Sets</p>
        <p class="text-3xl font-bold text-soft-black">{{ exercises.reduce((sum, ex) => sum + ex.sets.length, 0) }}</p>
      </div>
      <div class="bg-gradient-to-br from-pastel-yellow/20 to-pastel-yellow/5 rounded-xl p-5 border border-pastel-yellow/30">
        <p class="text-sm text-gray-600 mb-1">Duration</p>
        <p class="text-3xl font-bold text-soft-black">45m</p>
      </div>
    </div>

    <!-- Exercise List -->
    <div class="space-y-6 mb-6">
      <div
        v-for="(exercise, exIndex) in exercises"
        :key="exIndex"
        class="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-pastel-yellow/50 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <!-- Exercise header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-soft-black">{{ exercise.name }}</h3>
          <button 
            @click="addSet(exIndex)"
            class="px-4 py-2 bg-pastel-yellow/20 hover:bg-pastel-yellow/30 rounded-lg text-pastel-yellow font-semibold text-sm transition-colors"
          >
            + Add Set
          </button>
        </div>

        <!-- Sets table -->
        <div class="space-y-2">
          <div
            v-for="(set, setIndex) in exercise.sets"
            :key="setIndex"
            class="grid grid-cols-12 gap-3 items-center p-3 rounded-lg transition-colors"
            :class="set.completed ? 'bg-pastel-yellow/10' : 'bg-gray-50'"
          >
            <div class="col-span-2 text-center">
              <span class="text-sm font-semibold text-gray-600">Set {{ setIndex + 1 }}</span>
            </div>
            <div class="col-span-4">
              <input 
                type="number" 
                v-model="set.weight"
                placeholder="Weight (kg)"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-pastel-yellow focus:outline-none text-center"
              />
            </div>
            <div class="col-span-1 text-center text-gray-400">×</div>
            <div class="col-span-3">
              <input 
                type="number" 
                v-model="set.reps"
                placeholder="Reps"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-pastel-yellow focus:outline-none text-center"
              />
            </div>
            <div class="col-span-2 text-center">
              <button
                @click="toggleSetCompletion(exIndex, setIndex)"
                class="w-full py-2 rounded-lg font-semibold text-sm transition-all"
                :class="set.completed 
                  ? 'bg-pastel-yellow text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
              >
                {{ set.completed ? '✓' : '○' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Exercise Button -->
    <button
      @click="addExercise"
      class="w-full py-4 bg-gradient-to-r from-pastel-yellow to-pastel-red text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
    >
      ➕ Add Exercise
    </button>
  </div>
</template>

<style scoped>
.workout-log-tab {
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

/* Remove number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
