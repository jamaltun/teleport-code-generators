import { createProjectGenerator } from '@teleporthq/teleport-project-generator'
import {
  createReactComponentGenerator,
  ReactStyleVariation,
} from '@teleporthq/teleport-component-generator-react'
import { createComponentGenerator } from '@teleporthq/teleport-component-generator'

import reactAppRoutingPlugin from '@teleporthq/teleport-plugin-react-app-routing'
import importStatementsPlugin from '@teleporthq/teleport-plugin-import-statements'
import headConfigPlugin from '@teleporthq/teleport-plugin-jsx-head-config'
import prettierJS from '@teleporthq/teleport-postprocessor-prettier-js'

import { Mapping, FileType } from '@teleporthq/teleport-types'

import GatsbyProjectMapping from './gatsby-mapping.json'
import GatsbyTemplate from './project-template'
import { createCustomHTMLEntryFile } from './utils'

interface GatsbyProjectConfig {
  variation?: ReactStyleVariation
}

const createGatsbyProjectGenerator = (config: GatsbyProjectConfig = {}) => {
  const variation = config.variation ? config.variation : ReactStyleVariation.CSSModules

  const reactComponentGenerator = createReactComponentGenerator(variation)
  reactComponentGenerator.addMapping(GatsbyProjectMapping as Mapping)

  const reactPagesGenerator = createReactComponentGenerator(variation, {
    plugins: [headConfigPlugin],
    mappings: [GatsbyProjectMapping as Mapping],
  })

  const routingComponentGenerator = createComponentGenerator()
  routingComponentGenerator.addPlugin(reactAppRoutingPlugin)
  routingComponentGenerator.addPlugin(importStatementsPlugin)
  routingComponentGenerator.addPostProcessor(prettierJS)

  const htmlFileGenerator = createComponentGenerator()
  htmlFileGenerator.addPostProcessor(prettierJS)

  const generator = createProjectGenerator({
    components: {
      generator: reactComponentGenerator,
      path: ['src', 'components'],
    },
    pages: {
      generator: reactPagesGenerator,
      path: ['src', 'pages'],
      options: {
        useFileNameForNavigation: true,
      },
    },
    entry: {
      generator: htmlFileGenerator,
      path: ['src'],
      fileName: 'html',
      chunkGenerationFunction: createCustomHTMLEntryFile,
    },
    static: {
      prefix: '',
      path: ['static'],
    },
    framework: {
      config: {
        fileName: 'gatsby-config',
        fileType: FileType.JS,
        configPath: [''],
        styleVariation: variation,
      },
    },
  })

  return generator
}

export { createGatsbyProjectGenerator, GatsbyProjectMapping, GatsbyTemplate }
