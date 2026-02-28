// 测试 orchestrator 核心功能

import { analyzeGoal } from './src/orchestrator/goalAnalyzer.ts'
import { selectAgent, getAgentConfig } from './src/orchestrator/agentSelector.ts'

const AGENT_CONFIGS = {
  pop: { name: 'Pop', capabilities: ['feature', 'bugfix', 'docs', 'refactor', 'test', 'design', 'analysis'], successRate: 0.92 },
  codex: { name: 'Codex', capabilities: ['feature', 'bugfix', 'refactor', 'test'], successRate: 0.90 },
  claude: { name: 'Claude Code', capabilities: ['feature', 'bugfix', 'docs'], successRate: 0.88 },
  quill: { name: 'Quill', capabilities: ['docs'], successRate: 0.85 },
  echo: { name: 'Echo', capabilities: [], successRate: 0.80 },
  scout: { name: 'Scout', capabilities: ['analysis'], successRate: 0.85 },
  pixel: { name: 'Pixel', capabilities: ['design'], successRate: 0.75 },
}

console.log('=== 测试 Orchestrator ===\n')

// 测试 1: 目标分析
const testGoals = [
  '修复登录页面的 bug',
  '写一篇关于 AI Agent 调度的博客文章',
  '设计一个像素风格的办公室界面',
  '重构用户认证模块',
  '分析项目的技术债务',
]

for (const goal of testGoals) {
  console.log(`\n目标: "${goal}"`)
  
  try {
    const analysis = analyzeGoal(goal)
    console.log('  分析结果:', {
      title: analysis.title,
      type: analysis.type,
      area: analysis.area,
      complexity: analysis.estimatedComplexity,
    })
    
    const agent = selectAgent(analysis, AGENT_CONFIGS)
    console.log('  推荐 Agent:', agent)
    
    const config = getAgentConfig(agent)
    console.log('  Agent 配置:', config.model)
  } catch (e) {
    console.log('  错误:', e.message)
  }
}

console.log('\n=== 测试完成 ===')
