<script setup>
import nowLoadingVideo from '@/assets/liveScreen/NowLoading.mp4'

defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  text: {
      type: String,
      default: "Loading..."
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
       
       <!-- Main Content Wrapper -->
       <div class="relative flex flex-col items-center gap-6">
           
           <!-- Video Frame: TV or Game Console Style -->
           <div class="relative p-2 bg-gray-800 rounded-3xl shadow-2xl border-4 border-gray-700">
               <!-- Screen -->
               <div class="relative w-[320px] h-[240px] md:w-[480px] md:h-[360px] bg-black rounded-2xl overflow-hidden border-2 border-gray-900">
                  <video 
                    :src="nowLoadingVideo" 
                    autoplay 
                    muted 
                    loop 
                    playsinline
                    class="w-full h-full object-cover"
                  ></video>
                  
                  <!-- Scanline Effect (Overlay) -->
                  <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
               </div>

               <!-- Deco Elements -->
               <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-600 rounded-full mb-2"></div>
           </div>

           <!-- Loading Text -->
           <div class="flex flex-col items-center gap-2">
                <h2 class="text-3xl font-black text-pastel-red tracking-widest animate-pulse drop-shadow-sm font-sans">
                    {{ text }}
                </h2>
                <div class="flex gap-2">
                    <div class="w-3 h-3 bg-pastel-blue rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-3 h-3 bg-pastel-yellow rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-3 h-3 bg-pastel-red rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
           </div>

       </div>

    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
