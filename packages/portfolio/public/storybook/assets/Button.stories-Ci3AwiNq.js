import{j as t}from"./jsx-runtime-D_zvdyIk.js";import{i as r,B as n}from"./Button-B4hTHVQZ.js";import"./iframe-Pnzrz5em.js";import"./preload-helper-PPVm8Dsz.js";const d=(e,l)=>{const{storyTheme:o="light"}=l.args;return t.jsx("div",{"data-theme":o,style:{display:"flex",justifyContent:"center",width:"100%",height:"100%",borderRadius:"6px",background:"var(--bg-surface)",paddingTop:"2rem",paddingBottom:"2rem",transition:"background-color 0.3s ease"},children:t.jsx(e,{})})},c=({children:e})=>t.jsxs("div",{style:{display:"flex",gap:"1rem"},children:[t.jsx("div",{"data-theme":"light",style:{flex:1,padding:"1rem",background:"var(--bg-app)",borderRadius:"6px"},children:e}),t.jsx("div",{"data-theme":"dark",style:{flex:1,padding:"1rem",background:"var(--bg-app)",borderRadius:"6px"},children:e})]}),y={title:"Components/Button",component:n,tags:["autodocs"],decorators:[d],parameters:{docs:{description:r.t("button.componentDescription")}},argTypes:{storyTheme:{control:"inline-radio",options:["light","dark"],description:r.t("storyTheme.description"),table:{category:"Story Config",type:{summary:void 0}}},variant:{control:"select",description:r.t("button.argTypes.variant.description"),options:["fill","outlined","content"],table:{category:"Appearance",type:{summary:"'fill' | 'outlined' | 'content'"}}},color:{control:"select",description:r.t("button.argTypes.color.description"),options:["primary","neutral","danger","warning"],table:{category:"Appearance",type:{summary:"'primary' | 'neutral' | 'danger' | 'warning'"}}},size:{control:"inline-radio",description:r.t("button.argTypes.size.description"),options:["sm","md","lg"],table:{category:"Appearance",type:{summary:"'sm' | 'md' | 'lg'"}}},children:{control:"text",description:r.t("button.argTypes.children.description"),table:{category:"Content"}},disabled:{control:"boolean",description:r.t("button.argTypes.disabled.description"),table:{category:"State",type:{summary:"boolean"}}},type:{control:!1,description:r.t("button.argTypes.type.description"),table:{category:"Accessibility"}},onClick:{control:!1,action:"clicked",description:r.t("button.argTypes.onClick.description"),table:{category:"Events",type:{summary:void 0}}},className:{control:!1,description:r.t("button.argTypes.className.description"),table:{category:"Styling",type:{summary:void 0}}},style:{control:!1,description:r.t("button.argTypes.style.description"),table:{category:"Styling",type:{summary:void 0}}}},args:{storyTheme:"light",children:r.t("button.stories.primary.children")}},a={name:r.t("button.stories.primary.name"),args:{variant:"fill",color:"primary",storyTheme:"light"},render:e=>t.jsx(n,{...e,children:e.children||r.t("button.stories.primary.children")})},s={name:r.t("button.stories.allVariantsInBothThemes.name"),decorators:[],parameters:{controls:{hideNoControlsWarning:!0}},render:e=>{const{children:l,...o}=e;return t.jsx(c,{children:t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[t.jsx(n,{...o,color:"primary",variant:"fill",children:r.t("button.stories.allVariants.fill")}),t.jsx(n,{...o,color:"primary",variant:"outlined",children:r.t("button.stories.allVariants.outlined")}),t.jsx(n,{...o,color:"primary",variant:"content",children:r.t("button.stories.allVariants.content")})]})})}},i={name:r.t("button.stories.allColorsInBothThemes.name"),decorators:[],parameters:{controls:{hideNoControlsWarning:!0}},render:e=>{const{children:l,...o}=e;return t.jsx(c,{children:t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[t.jsx(n,{...o,variant:"fill",color:"primary",children:r.t("button.stories.allColors.primary")}),t.jsx(n,{...o,variant:"fill",color:"neutral",children:r.t("button.stories.allColors.neutral")}),t.jsx(n,{...o,variant:"fill",color:"danger",children:r.t("button.stories.allColors.danger")}),t.jsx(n,{...o,variant:"fill",color:"warning",children:r.t("button.stories.allColors.warning")})]})})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: i18n.t('button.stories.primary.name'),
  args: {
    variant: 'fill',
    color: 'primary',
    storyTheme: 'light'
  },
  render: args => <Button {...args}>\r
      {args.children || i18n.t('button.stories.primary.children')}\r
    </Button>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: i18n.t('button.stories.allVariantsInBothThemes.name'),
  decorators: [],
  parameters: {
    controls: {
      hideNoControlsWarning: true
    }
  },
  render: args => {
    const {
      children,
      ...restArgs
    } = args;
    return <BothThemesWrapper>\r
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>\r
          <Button {...restArgs} color="primary" variant="fill">\r
            {i18n.t('button.stories.allVariants.fill')}\r
          </Button>\r
          <Button {...restArgs} color="primary" variant="outlined">\r
            {i18n.t('button.stories.allVariants.outlined')}\r
          </Button>\r
          <Button {...restArgs} color="primary" variant="content">\r
            {i18n.t('button.stories.allVariants.content')}\r
          </Button>\r
        </div>\r
      </BothThemesWrapper>;
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: i18n.t('button.stories.allColorsInBothThemes.name'),
  decorators: [],
  parameters: {
    controls: {
      hideNoControlsWarning: true
    }
  },
  render: args => {
    const {
      children,
      ...restArgs
    } = args;
    return <BothThemesWrapper>\r
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>\r
          <Button {...restArgs} variant="fill" color="primary">\r
            {i18n.t('button.stories.allColors.primary')}\r
          </Button>\r
          <Button {...restArgs} variant="fill" color="neutral">\r
            {i18n.t('button.stories.allColors.neutral')}\r
          </Button>\r
          <Button {...restArgs} variant="fill" color="danger">\r
            {i18n.t('button.stories.allColors.danger')}\r
          </Button>\r
          <Button {...restArgs} variant="fill" color="warning">\r
            {i18n.t('button.stories.allColors.warning')}\r
          </Button>\r
        </div>\r
      </BothThemesWrapper>;
  }
}`,...i.parameters?.docs?.source}}};const h=["Primary","AllVariantsInBothThemes","AllColorsInBothThemes"];export{i as AllColorsInBothThemes,s as AllVariantsInBothThemes,a as Primary,h as __namedExportsOrder,y as default};
