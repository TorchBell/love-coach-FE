<script setup>
import { ref, computed } from 'vue'
import tomaIcon from '@/assets/smallIcon/toma.jpg'
import belleIcon from '@/assets/smallIcon/belle.jpg'
import chiiIcon from '@/assets/smallIcon/chii.jpg'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    reportContent: {
        type: String,
        default: ''
    },
    npcId: {
        type: Number,
        default: 1 // 1: 토마(식단), 2: 벨(근력), 3: 치에(유산소)
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    analysisDate: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close'])

// NPC 정보 매핑
const npcInfo = computed(() => {
    const npcMap = {
        1: { name: '토마', role: '영양관리 담당의', icon: tomaIcon, specialty: '식단 분석', color: 'pastel-red' },
        2: { name: '벨', role: '근력훈련 담당의', icon: belleIcon, specialty: '근력 분석', color: 'pastel-blue' },
        3: { name: '치에', role: '유산소운동 담당의', icon: chiiIcon, specialty: '유산소 분석', color: 'pastel-yellow' }
    }
    return npcMap[props.npcId] || npcMap[1]
})

// 마크다운을 HTML로 변환 (표 지원)
const parseMarkdownLine = (line) => {
    // Bold: **text** -> <strong>text</strong>
    let result = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* -> <em>text</em>
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    return result
}

// 리포트 내용을 섹션별로 파싱 (마크다운 표 지원)
const parsedSections = computed(() => {
    if (!props.reportContent) return []
    
    const lines = props.reportContent.split('\n')
    const sections = []
    let currentSection = { title: '종합 분석', content: [], tables: [] }
    let currentTable = null
    
    lines.forEach((line, idx) => {
        const trimmed = line.trim()
        
        // 헤딩 감지 (## 또는 ###)
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
            if (currentSection.content.length > 0 || currentSection.tables.length > 0) {
                sections.push(currentSection)
            }
            currentSection = { 
                title: trimmed.replace(/^#+\s*/, ''), 
                content: [],
                tables: []
            }
            currentTable = null
            return
        }
        
        // 테이블 행 감지 (| 로 시작)
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            // 구분선 행 (|---|---|) 스킵
            if (trimmed.includes('---') || trimmed.includes(':-')) {
                return
            }
            
            // 테이블 시작 또는 계속
            const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim())
            
            if (!currentTable) {
                // 새 테이블 시작 - 첫 행은 헤더
                currentTable = { headers: cells, rows: [] }
            } else {
                // 데이터 행 추가
                currentTable.rows.push(cells)
            }
            return
        }
        
        // 테이블 종료 (빈 줄이나 다른 콘텐츠)
        if (currentTable) {
            currentSection.tables.push(currentTable)
            currentTable = null
        }
        
        // 일반 텍스트
        if (trimmed) {
            currentSection.content.push({
                text: parseMarkdownLine(trimmed),
                isList: trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed),
                isBold: trimmed.startsWith('**')
            })
        }
    })
    
    // 마지막 테이블 처리
    if (currentTable) {
        currentSection.tables.push(currentTable)
    }
    
    // 마지막 섹션 처리
    if (currentSection.content.length > 0 || currentSection.tables.length > 0) {
        sections.push(currentSection)
    }
    
    return sections.length > 0 ? sections : [{ 
        title: '분석 결과', 
        content: [{ text: props.reportContent, isList: false, isBold: false }],
        tables: []
    }]
})

const handleClose = () => {
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <!-- z-index를 9999로 높임 -->
            <div v-if="show" class="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" style="z-index: 9999;" @click.self="handleClose">
                <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" style="z-index: 10000;">
                    
                    <!-- Header: 병원 진단서 스타일 -->
                    <div class="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6 flex-shrink-0">
                        <!-- 상단 패턴 -->
                        <div class="absolute top-0 left-0 right-0 h-1" :class="`bg-${npcInfo.color}`"></div>
                        
                        <div class="flex items-start gap-5">
                            <!-- NPC 사진 (왼쪽 상단) -->
                            <div class="flex-shrink-0">
                                <div class="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-100">
                                    <img :src="npcInfo.icon" class="w-full h-full object-cover" :alt="npcInfo.name" />
                                </div>
                            </div>
                            
                            <!-- 진단서 헤더 정보 -->
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-bold text-white px-2 py-0.5 rounded-full" :class="`bg-${npcInfo.color}`">
                                        AI ANALYSIS
                                    </span>
                                    <span class="text-xs text-gray-400">{{ analysisDate || new Date().toLocaleDateString('ko-KR') }}</span>
                                </div>
                                <h2 class="text-2xl font-black text-gray-800 mb-1">건강 분석 리포트</h2>
                                <div class="flex items-center gap-2 text-sm text-gray-500">
                                    <span class="font-medium">{{ npcInfo.role }}</span>
                                    <span class="text-gray-300">|</span>
                                    <span class="font-bold" :class="`text-${npcInfo.color}`">{{ npcInfo.name }}</span>
                                </div>
                            </div>
                            
                            <!-- 닫기 버튼 -->
                            <button @click="handleClose" class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content: 분석 결과 -->
                    <div class="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        <!-- 로딩 상태 -->
                        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
                            <div class="w-16 h-16 rounded-full border-4 border-gray-200 border-t-pastel-red animate-spin mb-4"></div>
                            <p class="text-gray-500 font-medium">AI가 데이터를 분석하고 있습니다...</p>
                            <p class="text-xs text-gray-400 mt-1">약 10~20초 소요됩니다</p>
                        </div>
                        
                        <!-- 분석 결과 섹션들 -->
                        <div v-else-if="reportContent" class="space-y-5">
                            <div 
                                v-for="(section, idx) in parsedSections" 
                                :key="idx"
                                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                            >
                                <!-- 섹션 제목 -->
                                <div class="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                    <div class="w-2 h-2 rounded-full" :class="`bg-${npcInfo.color}`"></div>
                                    <h3 class="font-bold text-gray-800">{{ section.title }}</h3>
                                </div>
                                
                                <!-- 섹션 내용 (텍스트) -->
                                <div v-if="section.content.length > 0" class="space-y-2 mb-4">
                                    <div 
                                        v-for="(item, lineIdx) in section.content" 
                                        :key="lineIdx"
                                        class="text-gray-600 text-sm leading-relaxed"
                                        :class="{
                                            'pl-4 border-l-2 border-gray-200': item.isList
                                        }"
                                        v-html="item.text.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')"
                                    >
                                    </div>
                                </div>
                                
                                <!-- 테이블 렌더링 -->
                                <div v-for="(table, tableIdx) in section.tables" :key="`table-${tableIdx}`" class="overflow-x-auto mt-4">
                                    <table class="w-full text-sm border-collapse">
                                        <thead>
                                            <tr class="bg-gray-100">
                                                <th 
                                                    v-for="(header, hIdx) in table.headers" 
                                                    :key="hIdx"
                                                    class="px-4 py-2 text-left font-bold text-gray-700 border border-gray-200"
                                                >
                                                    {{ header }}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr 
                                                v-for="(row, rIdx) in table.rows" 
                                                :key="rIdx"
                                                class="hover:bg-gray-50"
                                                :class="rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'"
                                            >
                                                <td 
                                                    v-for="(cell, cIdx) in row" 
                                                    :key="cIdx"
                                                    class="px-4 py-2 text-gray-600 border border-gray-200"
                                                >
                                                    {{ cell }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 빈 상태 -->
                        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="font-bold text-lg">분석 결과가 없습니다</p>
                            <p class="text-sm mt-1">데이터를 분석해주세요</p>
                        </div>
                    </div>
                    
                    <!-- Footer: 서명 영역 -->
                    <div class="bg-white border-t border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100">
                                <img :src="npcInfo.icon" class="w-full h-full object-cover" />
                            </div>
                            <div class="text-xs text-gray-400">
                                <span class="font-medium text-gray-600">{{ npcInfo.name }}</span> 담당의 서명
                            </div>
                        </div>
                        <button 
                            @click="handleClose" 
                            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all"
                            :class="`bg-${npcInfo.color} text-white hover:brightness-110 shadow-md`"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.animate-slide-up {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
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
