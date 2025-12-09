<script setup>
import MainLayout from '../layouts/MainLayout.vue'
import PhotoCard from '../components/PhotoCard.vue'
import { ref, defineEmits } from 'vue'

// Define emits
const emit = defineEmits(['scroll'])

// Assets
import tomaImg from '@/assets/images/toma.png'
import belleImg from '@/assets/images/belle.png'
import chieImg from '@/assets/images/chie.png'

// Scroll handler
const handleScroll = (e) => {
  emit('scroll', e)
}

// Scroll to Section Logic
const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Left Sidebar Items (4 Items)
const leftItems = [
  { 
    id: 'diet', 
    title: 'Diet Master', 
    description: 'Food tracking', 
    image: tomaImg,
    subtitle: 'Nutrition Journey',
    details: 'Track your meals and reach your calorie goals with our comprehensive food database.'
  },
  { 
    id: 'workout', 
    title: 'Workout Champion', 
    description: 'Strength training', 
    image: belleImg,
    subtitle: 'Power & Strength',
    details: 'Log your workouts and watch your strength grow with detailed exercise tracking.'
  },
  { 
    id: 'body', 
    title: 'Body Transformation', 
    description: 'Progress tracking', 
    image: chieImg,
    subtitle: 'Your Journey',
    details: 'Monitor your weight, body composition, and see your transformation over time.'
  },
  { 
    id: 'water', 
    title: 'Hydration Hero', 
    description: 'Water tracking', 
    image: tomaImg,
    subtitle: 'Stay Hydrated',
    details: 'Keep track of your water intake and maintain optimal hydration throughout the day.'
  },
]

// Right Sidebar Items (4 Items)
const rightItems = [
  { 
    id: 'running', 
    title: 'Running Legend', 
    description: 'Endurance', 
    image: chieImg,
    subtitle: 'Go the Distance',
    details: 'Track your runs, monitor your pace, and achieve new personal records.'
  },
  { 
    id: 'shop', 
    title: 'Shopping Spree', 
    description: 'Collectibles', 
    image: belleImg,
    subtitle: 'Rewards & Items',
    details: 'Unlock special items and rewards as you progress through your fitness journey.'
  },
  { 
    id: 'achievements', 
    title: 'Achievement Hunter', 
    description: 'Milestones', 
    image: tomaImg,
    subtitle: 'Badges of Honor',
    details: 'Complete challenges and earn badges that showcase your dedication and progress.'
  },
  { 
    id: 'journey', 
    title: 'Fitness Journey', 
    description: 'Overview', 
    image: belleImg,
    subtitle: 'Your Story',
    details: 'View your complete fitness timeline and celebrate every milestone along the way.'
  },
]

// All items for gallery
const allItems = [...leftItems, ...rightItems]
</script>

<template>
  <MainLayout @scroll="handleScroll">
    <!-- Left Sidebar Content -->
    <template #left>
      <PhotoCard 
        v-for="item in leftItems" 
        :key="item.id" 
        :title="item.title" 
        :description="item.description"
        :image="item.image"
        @click="scrollToSection(item.id)"
      />
    </template>

    <!-- Center Gallery Content -->
    <template #default>
      <!-- Gallery Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-soft-black mb-4 tracking-tight">
          Hall of Fame
        </h1>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
          Your fitness journey visualized. Click the cards on the sides to jump to any section.
        </p>
        <div class="w-24 h-1 bg-gradient-to-r from-pastel-red via-pastel-yellow to-pastel-blue mx-auto mt-6 rounded-full"></div>
      </div>

      <!-- Gallery Items (8 Total) -->
      <div class="space-y-20">
        <section 
          v-for="(item, index) in allItems" 
          :key="item.id" 
          :id="item.id" 
          class="gallery-item group"
        >
          <!-- Expanded Gallery Card -->
          <div class="bg-white rounded-3xl shadow-soft hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:border-pastel-red/30">
            <!-- Image Section -->
            <div class="relative h-96 overflow-hidden bg-gradient-to-br from-cream/50 to-white">
              <div class="absolute inset-0 flex items-center justify-center">
                <img 
                  :src="item.image" 
                  :alt="item.title"
                  class="w-80 h-80 object-cover rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <!-- Overlay badge -->
              <div class="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <span class="text-sm font-semibold text-pastel-red">#{{ index + 1 }}</span>
              </div>
            </div>

            <!-- Content Section -->
            <div class="p-8">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-3xl font-bold text-soft-black mb-1">{{ item.title }}</h2>
                  <p class="text-pastel-blue font-semibold text-sm tracking-wide uppercase">{{ item.subtitle }}</p>
                </div>
                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pastel-red/20 to-pastel-blue/20 flex items-center justify-center">
                  <span class="text-2xl">{{ index % 2 === 0 ? '🏆' : '⭐' }}</span>
                </div>
              </div>
              
              <p class="text-gray-600 text-lg leading-relaxed mb-6">
                {{ item.details }}
              </p>

              <!-- Stats/Progress Bar Placeholder -->
              <div class="bg-cream/30 rounded-xl p-4 border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-semibold text-gray-700">Progress</span>
                  <span class="text-sm font-bold text-pastel-red">{{ Math.floor(Math.random() * 40 + 60) }}%</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-pastel-red to-pastel-yellow rounded-full transition-all duration-1000"
                    :style="{ width: `${Math.floor(Math.random() * 40 + 60)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- End Message -->
      <div class="text-center mt-24 mb-12">
        <p class="text-gray-400 text-lg">
          Keep pushing forward! 💪
        </p>
      </div>
    </template>

    <!-- Right Sidebar Content -->
    <template #right>
      <PhotoCard 
        v-for="item in rightItems" 
        :key="item.id" 
        :title="item.title" 
        :description="item.description"
        :image="item.image"
        @click="scrollToSection(item.id)"
      />
    </template>
  </MainLayout>
</template>

<style scoped>
.gallery-item {
  scroll-margin-top: 2rem;
}
</style>
