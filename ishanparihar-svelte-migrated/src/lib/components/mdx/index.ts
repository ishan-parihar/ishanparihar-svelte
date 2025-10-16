import H1 from './H1.svelte';
import H2 from './H2.svelte';
import H3 from './H3.svelte';
import H4 from './H4.svelte';
import P from './P.svelte';
import UL from './UL.svelte';
import OL from './OL.svelte';
import LI from './LI.svelte';
import Blockquote from './Blockquote.svelte';
import CustomLink from './CustomLink.svelte';
import CustomImage from './CustomImage.svelte';
import Strong from './Strong.svelte';
import Code from './Code.svelte';
import Pre from './Pre.svelte';
import HR from './HR.svelte';
import Table from './Table.svelte';
import THead from './THead.svelte';
import TR from './TR.svelte';
import TH from './TH.svelte';
import TD from './TD.svelte';
import Callout from './Callout.svelte';
import Details from './Details.svelte';
import Summary from './Summary.svelte';
import Section from './Section.svelte';

export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  a: CustomLink,
  img: CustomImage,
  Image: CustomImage,
  strong: Strong,
  code: Code,
  pre: Pre,
  hr: HR,
  table: Table,
  thead: THead,
  tr: TR,
  th: TH,
  td: TD,
  Callout,
  details: Details,
  summary: Summary,
  Section,
};
