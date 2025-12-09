<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-white font-sans selection:bg-pastel-red selection:text-white">
    
    <!-- Top Navigation Bar (Fixed) -->
    <nav class="fixed top-0 left-0 w-full h-16 bg-white/95 backdrop-blur-md shadow-soft z-50 flex justify-between items-center px-8 border-b border-gray-100">
      <div class="flex gap-8 text-soft-black font-semibold">
        <router-link 
          to="/" 
          class="hover:text-pastel-red transition-colors duration-300 relative group"
          active-class="text-pastel-red"
        >
          Home
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-red group-hover:w-full transition-all duration-300"></span>
        </router-link>
        <router-link 
          to="/log" 
          class="hover:text-pastel-red transition-colors duration-300 relative group"
          active-class="text-pastel-red"
        >
          Log
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-red group-hover:w-full transition-all duration-300"></span>
        </router-link>
        <router-link 
          to="/achievement" 
          class="hover:text-pastel-red transition-colors duration-300 relative group"
          active-class="text-pastel-red"
        >
          Achievements
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-red group-hover:w-full transition-all duration-300"></span>
        </router-link>
        <router-link 
          to="/mypage" 
          class="hover:text-pastel-red transition-colors duration-300 relative group"
          active-class="text-pastel-red"
        >
          My Page
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-red group-hover:w-full transition-all duration-300"></span>
        </router-link>
      </div>
      
      <!-- Logo in Nav -->
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold text-pastel-red tracking-widest">LoveNyam</span>
        <span class="text-sm text-pastel-blue font-semibold">FITNESS</span>
      </div>
    </nav>

    <!-- Main 3-Column Layout with Fixed Sidebars -->
    <div class="pt-16 flex w-full mx-auto max-w-[1920px]">
      
      <!-- Left Sidebar (FIXED Position) -->
      <aside class="fixed left-0 top-16 w-[280px] h-[calc(100vh-4rem)] bg-gradient-to-b from-cream/40 to-cream/20 border-r border-gray-200/50 overflow-y-auto scrollbar-hide z-30">
        <div class="p-5 space-y-4">
          <slot name="left"></slot>
        </div>
      </aside>

      <!-- Center Content (Scrollable Gallery) - with left/right margins for sidebars -->
      <main 
        class="flex-1 ml-[280px] mr-[280px] min-h-screen bg-white overflow-y-auto"
        @scroll="$emit('scroll', $event)"
      >
        <div class="px-8 py-12 max-w-5xl mx-auto">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <footer class="mt-20 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
          <p>&copy; 2024 LoveNyam & Fitness. All rights reserved.</p>
          <p class="text-xs mt-2">Keep moving forward 💪</p>
        </footer>
      </main>

      <!-- Right Sidebar (FIXED Position) -->
      <aside class="fixed right-0 top-16 w-[280px] h-[calc(100vh-4rem)] bg-gradient-to-b from-cream/40 to-cream/20 border-l border-gray-200/50 overflow-y-auto scrollbar-hide z-30">
        <div class="p-5 space-y-4">
          <slot name="right"></slot>
        </div>
      </aside>

    </div>

  </div>
</template>

<style scoped>
/* Hide scrollbar but allow scrolling */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth scroll behavior */
main {
  scroll-behavior: smooth;
}
</style>
