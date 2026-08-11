export interface BuilderClassInputs {
  stack: string;
  role?: string;
}

/**
 * Maps stack and role inputs to over 30 carefully crafted HH Goa Builder Classes.
 */
export function generateBuilderClass(inputs: BuilderClassInputs): string {
  const stackRaw = (inputs.stack || '').toLowerCase().trim();
  const roleRaw = (inputs.role || '').toLowerCase().trim();

  if (!stackRaw && !roleRaw) {
    return 'CREATIVE BUILDER';
  }

  const text = `${stackRaw} ${roleRaw}`;

  // Helper match flags
  const hasAI = /ai|ml|machine learning|deep learning|llm|genai|neural|agent/i.test(text);
  const hasHardware = /hardware|iot|embedded|robotics|circuit|raspberry|arduino|edge/i.test(text);
  const hasFrontend = /frontend|front-end|react|vue|next|svelte|ui|css|web|mobile|flutter|swift|android|ios/i.test(text);
  const hasBackend = /backend|back-end|node|express|python|go|rust|java|api|server|microservice|database|sql/i.test(text);
  const hasData = /data|analytics|pipeline|spark|sql|bi|etl|postgres/i.test(text);
  const hasCyber = /cyber|security|sec|pentest|crypto|web3|solidity|blockchain|zk/i.test(text);
  const hasDesign = /design|figma|ux|visual|graphic|creative|art|designer/i.test(text);
  const hasProduct = /product|pm|founder|lead|manager|strategy|growth/i.test(text);
  const hasFullStack = /full stack|fullstack|full-stack|all rounder|generalist/i.test(text);
  const hasDevOps = /devops|cloud|aws|docker|kubernetes|infra|sre|ci\/cd/i.test(text);

  // Combination Mappings (Multi-Domain Synergies)
  if (hasAI && hasHardware) return 'EDGE INTELLIGENCE ARCHITECT';
  if (hasAI && hasFrontend) return 'INTELLIGENT INTERFACE BUILDER';
  if (hasAI && hasBackend) return 'NEURAL SYSTEMS ENGINEER';
  if (hasAI && hasData) return 'INTELLIGENCE PIPELINE ARCHITECT';
  if (hasAI && hasCyber) return 'AUTONOMOUS DEFENSE ENGINEER';
  if (hasAI && hasDesign) return 'AI EXPERIENCE DESIGNER';
  if (hasAI && hasProduct) return 'AI PRODUCT STRATEGIST';
  
  if (hasHardware && hasBackend) return 'PHYSICAL SYSTEMS ARCHITECT';
  if (hasHardware && hasFrontend) return 'SPATIAL INTERACTION BUILDER';
  if (hasHardware && hasDevOps) return 'EMBEDDED INFRASTRUCTURE ENGINEER';

  if (hasFullStack && hasAI) return 'FULL-STACK NEURAL ENGINEER';
  if (hasFullStack && hasCyber) return 'SECURE FULL-STACK SHIPPER';
  if (hasFullStack) return 'PRODUCT SHIPPER';

  if (hasFrontend && hasBackend) return 'FULL-SPECTRUM WEB ENGINEER';
  if (hasFrontend && hasDesign) return 'CREATIVE INTERFACE ARCHITECT';
  if (hasFrontend && hasCyber) return 'SECURE CLIENT ENGINEER';

  if (hasBackend && hasData) return 'DATA SYSTEMS ARCHITECT';
  if (hasBackend && hasDevOps) return 'CLOUD INFRASTRUCTURE ARCHITECT';
  if (hasBackend && hasCyber) return 'CYBER DEFENSE ARCHITECT';

  if (hasData && hasCyber) return 'DATA SECURITY SPECIALIST';
  if (hasData && hasProduct) return 'DATA-DRIVEN PRODUCT LEAD';

  if (hasDesign && hasProduct) return 'DESIGN-LED FOUNDER';
  if (hasDesign && hasFrontend) return 'VISUAL ENGINEER';

  if (hasCyber && hasBackend) return 'CRYPTOGRAPHIC SYSTEMS ENGINEER';
  if (hasCyber) return 'DIGITAL GUARDIAN';

  // Single-Domain Masteries
  if (hasAI) return 'NEURAL ARCHITECT';
  if (hasHardware) return 'EDGE BUILDER';
  if (hasFrontend) return 'INTERFACE BUILDER';
  if (hasBackend) return 'SYSTEMS ARCHITECT';
  if (hasData) return 'DATA EXPLORER';
  if (hasDesign) return 'VISUAL ENGINEER';
  if (hasProduct) return 'PRODUCT BUILDER';
  if (hasDevOps) return 'CLOUD INFRASTRUCTURE ENGINEER';

  // Role Specific Fallbacks
  if (/founder|co-founder|ceo|builder/i.test(roleRaw)) return 'FOUNDING BUILDER';
  if (/hacker|student|fellow|researcher/i.test(roleRaw)) return 'OPEN SOURCE EXPLORER';

  return 'GOAN PROTOCOL BUILDER';
}
