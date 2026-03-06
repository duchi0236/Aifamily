# Aifamily - 自动化室内设计多智能体系统

基于Next.js的端到端自动化室内设计工作流平台，实现从概念生成到施工落地的全流程AI自动化。

## 项目架构
- **前端**: Next.js 14 (App Router + Server Actions)
- **后端**: 多智能体协调系统 (Node.js + Python微服务)
- **AI引擎**: 多模型集成 (LLM + Diffusion + ControlNet)
- **API集成**: Pinterest, Coohom, OpenBOM, 区域供应商API

## 核心功能
1. **概念化智能体** - 风格确定与情绪板生成
2. **空间设计智能体** - 2D/3D空间重建与布局
3. **渲染智能体** - 照片级渲染与VR全景
4. **采购智能体** - BOM提取与供应商匹配

## 技术栈
- Next.js 14 + TypeScript
- Tailwind CSS + ShadCN UI
- tRPC (类型安全API)
- Redis (工作记忆)
- PostgreSQL (持久化存储)
- Docker (微服务部署)
- WebSockets (实时协作)