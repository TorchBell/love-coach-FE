<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'

// Achievement Categories
const categories = ref([
  { id: 'unlocked', name: 'Unlocked', icon: '🏆', count: 5 },
  { id: 'progress', name: 'In Progress', icon: '⏳', count: 3 },
  { id: 'locked', name: 'Locked', icon: '🔒', count: 12 }
])

const activeCategory = ref('unlocked')

// Achievement data (mock)
const achievements = ref({
  unlocked: [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      reward: '+50 XP',
      unlockedDate: '2024-01-15',
      image: 'https://via.placeholder.com/200x200/FFB6C1/FFFFFF?text=Achievement'
    },
    {
      id: 2,
      title: 'Meal Tracker',
      description: 'Log 7 days of meals consecutively',
      icon: '🍽️',
      reward: '+100 XP',
      unlockedDate: '2024-01-12',
      image: 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Achievement'
    },
    {
      id: 3,
      title: 'Early Bird',
      description: 'Complete a morning workout',
      icon: '🌅',
      reward: '+75 XP',
      unlockedDate: '2024-01-10',
      image: 'https://via.placeholder.com/200x200/87CEEB/FFFFFF?text=Achievement'
    },
    {
      id: 4,
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water in one day',
      icon: '💧',
      reward: '+50 XP',
      unlockedDate: '2024-01-08',
      image: 'https://via.placeholder.com/200x200/98D8C8/FFFFFF?text=Achievement'
    },
    {
      id: 5,
      title: 'Marathon Runner',
      description: 'Run a total of 42km',
      icon: '🏃',
      reward: '+200 XP',
      unlockedDate: '2024-01-05',
      image: 'https://via.placeholder.com/200x200/F7CAC9/FFFFFF?text=Achievement'
    }
  ],
  progress: [
    {
      id: 6,
      title: 'Strength Builder',
      description: 'Complete 50 strength workouts',
      icon: '💪',
      progress: 32,
      total: 50,
      image: 'https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=In+Progress'
    },
    {
      id: 7,
      title: 'Weight Warrior',
      description: 'Lose 5kg',
      icon: '⚖️',
      progress: 3.2,
      total: 5,
      image: 'https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=In+Progress'
    },
    {
      id: 8,
      title: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      icon: '🔥',
      progress: 18,
      total: 30,
      image: 'https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=In+Progress'
    }
  ],
  locked: [
    {
      id: 9,
      title: '???',
      hint: 'Complete 100 workouts to unlock this achievement',
      icon: '❓'
    },
    {
      id: 10,
      title: '???',
      hint: 'Reach your goal weight to unlock this achievement',
      icon: '❓'
    },
    {
      id: 11,
      title: '???',
      hint: 'Complete a perfect week (all activities logged) to unlock',
      icon: '❓'
    },
    {
      id: 12,
      title: '???',
      hint: 'Run a total of 100km to unlock this achievement',
      icon: '❓'
    },
    {
      id: 13,
      title: '???',
      hint: 'Unlock 10 other achievements first',
      icon: '❓'
    },
    {
      id: 14,
      title: '???',
      hint: 'Maintain a 60-day streak',
      icon: '❓'
    },
    {
      id: 15,
      title: '???',
      hint: 'Complete 200 workouts',
      icon: '❓'
    },
    {
      id: 16,
      title: '???',
      hint: 'Log 30 consecutive days of meals',
      icon: '❓'
    },
    {
      id: 17,
      title: '???',
      hint: 'Run a total of 500km',
      icon: '❓'
    },
    {
      id: 18,
      title: '???',
      hint: 'Achieve peak performance',
      icon: '❓'
    },
    {
      id: 19,
      title: '???',
      hint: 'Master all workout types',
      icon: '❓'
    },
    {
      id: 20,
      title: '???',
      hint: 'Become a fitness legend',
      icon: '❓'
    }
  ]
})
</script>

<template>
  <MainLayout>
    <template #default>
      <!-- Page Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-soft-black mb-4">Achievements</h1>
        <p class="text-lg text-gray-500">Complete challenges and unlock rewards on your fitness journey</p>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-4 mb-10">
        <button
          v-for="category in categories"
          :key="category.id"
          class="flex-1 py-4 px-6 rounded-2xl font-bold transition-all duration-300 border-2"
          :class="activeCategory === category.id 
            ? 'bg-gradient-to-r from-pastel-red to-pastel-yellow text-white border-transparent shadow-lg transform scale-105' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-pastel-red/50 hover:shadow-md'"
          @click="activeCategory = category.id"
        >
          <div class="flex items-center justify-center gap-3">
            <span class="text-2xl">{{ category.icon }}</span>
            <div class="text-left">
              <p class="text-sm">{{ category.name }}</p>
              <p class="text-xs opacity-75">({{ category.count }})</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Achievement Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Unlocked Achievements -->
        <template v-if="activeCategory === 'unlocked'">
          <div
            v-for="achievement in achievements.unlocked"
            :key="achievement.id"
            class="achievement-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-pastel-red/30 group"
          >
            <!-- Image -->
            <div class="h-48 overflow-hidden bg-gradient-to-br from-pastel-red/20 to-pastel-yellow/20 relative">
              <img 
                :src="achievement.image" 
                :alt="achievement.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div class="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span class="text-2xl">{{ achievement.icon }}</span>
              </div>
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-soft-black mb-2">{{ achievement.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
              <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                <span class="text-xs text-pastel-red font-semibold">{{ achievement.reward }}</span>
                <span class="text-xs text-gray-400">{{ achievement.unlockedDate }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- In Progress Achievements -->
        <template v-if="activeCategory === 'progress'">
          <div
            v-for="achievement in achievements.progress"
            :key="achievement.id"
            class="achievement-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-pastel-yellow/30"
          >
            <!-- Image (desaturated) -->
            <div class="h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <img 
                :src="achievement.image" 
                :alt="achievement.title"
                class="w-full h-full object-cover opacity-60"
              />
              <div class="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span class="text-2xl grayscale">{{ achievement.icon }}</span>
              </div>
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-soft-black mb-2">{{ achievement.title }}</h3>
              <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span class="font-bold text-pastel-yellow">{{ Math.round((achievement.progress / achievement.total) * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-pastel-yellow to-pastel-red rounded-full transition-all duration-500"
                    :style="{ width: `${(achievement.progress / achievement.total) * 100}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ achievement.progress }} / {{ achievement.total }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Locked Achievements -->
        <template v-if="activeCategory === 'locked'">
          <div
            v-for="achievement in achievements.locked"
            :key="achievement.id"
            class="achievement-card bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-300 group cursor-help"
            :title="achievement.hint"
          >
            <!-- Locked Image -->
            <div class="h-48 flex items-center justify-center bg-gray-300 relative">
              <div class="text-8xl opacity-30">🔒</div>
            </div>
            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-gray-400 mb-2">{{ achievement.title }}</h3>
              <div class="text-xs text-gray-500 italic bg-gray-200 rounded-lg p-3 group-hover:bg-white group-hover:text-gray-700 transition-colors">
                <span class="font-semibold">Hint:</span> {{ achievement.hint }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped>
.achievement-card {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
