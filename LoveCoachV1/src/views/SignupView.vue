<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Form Data
const form = ref({
  email: '',
  password: '',
  nickname: '',
  gender: 'M',
  birthDate: ''
})

const isLoading = ref(false)

const handleSignup = async () => {
  if (!form.value.email || !form.value.password || !form.value.nickname || !form.value.birthDate) {
    alert('모든 필드를 입력해주세요.')
    return
  }

  isLoading.value = true
  const success = await authStore.signup(form.value)
  isLoading.value = false

  if (success) {
    alert('회원가입이 완료되었습니다!')
    router.push('/')
  } else {
    alert('회원가입에 실패했습니다.')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 relative overflow-hidden">
    
    <!-- Background Elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-blue/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-pink/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>

    <!-- Card Container -->
    <div class="bg-white/70 backdrop-blur-xl p-10 md:p-14 rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/50 relative z-10 transition-all hover:shadow-3xl">
      
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-800 tracking-tight mb-2 font-sans">
          LoveCoach<br>회원가입
        </h1>
        <p class="text-slate-500 font-medium">건강한 라이프스타일의 시작</p>
      </div>

      <!-- Form -->
      <div class="space-y-6">
        
        <!-- Email -->
        <div class="group">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-pastel-blue transition-colors">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="w-full p-4 bg-white/50 rounded-xl border border-slate-200 focus:border-pastel-blue focus:ring-4 focus:ring-pastel-blue/10 focus:outline-none transition-all font-medium text-slate-700 placeholder-slate-300"
            placeholder="example@email.com"
          />
        </div>
        
        <!-- Password -->
        <div class="group">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-pastel-blue transition-colors">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full p-4 bg-white/50 rounded-xl border border-slate-200 focus:border-pastel-blue focus:ring-4 focus:ring-pastel-blue/10 focus:outline-none transition-all font-medium text-slate-700 placeholder-slate-300"
            placeholder="••••••••"
          />
        </div>

        <!-- Nickname -->
        <div class="group">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-pastel-blue transition-colors">Nickname</label>
          <input 
            v-model="form.nickname" 
            type="text" 
            class="w-full p-4 bg-white/50 rounded-xl border border-slate-200 focus:border-pastel-blue focus:ring-4 focus:ring-pastel-blue/10 focus:outline-none transition-all font-medium text-slate-700 placeholder-slate-300"
            placeholder="Your Nickname"
          />
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Gender</label>
          <div class="flex gap-4">
            <label class="flex-1 cursor-pointer">
              <input v-model="form.gender" type="radio" value="M" name="gender" class="peer sr-only" />
              <div class="p-3 text-center rounded-xl border border-slate-200 bg-white/50 peer-checked:bg-pastel-blue peer-checked:text-white peer-checked:border-pastel-blue transition-all font-bold text-slate-500 hover:bg-white">
                Male
              </div>
            </label>
            <label class="flex-1 cursor-pointer">
              <input v-model="form.gender" type="radio" value="F" name="gender" class="peer sr-only" />
              <div class="p-3 text-center rounded-xl border border-slate-200 bg-white/50 peer-checked:bg-pastel-pink peer-checked:text-white peer-checked:border-pastel-pink transition-all font-bold text-slate-500 hover:bg-white">
                Female
              </div>
            </label>
          </div>
        </div>

        <!-- Birth Date -->
        <div class="group">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1 group-focus-within:text-pastel-blue transition-colors">Birth Date</label>
          <input 
            v-model="form.birthDate" 
            type="date" 
            class="w-full p-4 bg-white/50 rounded-xl border border-slate-200 focus:border-pastel-blue focus:ring-4 focus:ring-pastel-blue/10 focus:outline-none transition-all font-medium text-slate-700"
          />
        </div>

        <!-- Submit Button -->
        <button 
          @click="handleSignup" 
          :disabled="isLoading"
          class="w-full mt-6 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creating Account...' : 'Join Now' }}
        </button>
        
        <!-- Back Link -->
        <div class="text-center mt-6">
          <router-link to="/home" class="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
            ← Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
