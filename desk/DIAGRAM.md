# SLDB UI Diagrams

## 1. Product / User Flow

```mermaid
flowchart LR
    user[Human operator]

    subgraph ui[@sldb/ui]
        workspace[Workspace shell]
        navigator[Document navigator]
        source[Source editor]
        rendered[Rendered view]
        inspector[Structure / markers / fields inspector]
        actions[Action toolbar]
        drafts[Local draft state]
    end

    subgraph marcado[@marcado/]
        mparse[Canonical parse / render runtime]
        mmap[Source map + marker semantics]
    end

    subgraph sldb[@sldb/]
        tracked[Tracked docs]
        models[Model contracts]
        fields[Field / section operations]
        validate[Validate / compose / recover]
        store[.sldb store]
    end

    subgraph local[Local workspace]
        md[Markdown documents]
        fs[File System Access API]
        upload[Upload / download fallback]
        samples[Bundled sample docs]
    end

    user --> workspace
    workspace --> navigator
    workspace --> source
    workspace --> rendered
    workspace --> inspector
    workspace --> actions
    workspace --> drafts

    navigator --> md
    navigator --> samples
    source <--> drafts
    source <--> fs
    source <--> upload
    source <--> md

    source --> mparse
    rendered --> mparse
    inspector --> mmap
    mparse --> mmap

    workspace --> tracked
    workspace --> models
    workspace --> fields
    workspace --> validate
    tracked --> store
    models --> store
    fields --> store
    validate --> store
```

## 2. Architecture / Container View

```mermaid
flowchart TB
    subgraph browser[Browser frontend]
        app[React + Vite app]
        state[Workspace state]
        editor[Source editor]
        viewer[Rendered document viewer]
        panel[Inspector panels]
        adapterM[Marcado adapter]
        adapterS[SLDB adapter]
    end

    subgraph runtimeM[@marcado runtime boundary]
        parse[Parse document]
        render[Render structure]
        sourcemap[Source mapping]
        markers[Marker semantics]
    end

    subgraph runtimeS[@sldb runtime boundary]
        docs[Tracked doc operations]
        contracts[Model contracts]
        sectionops[Field / section ops]
        workflows[Validate / compose / recover]
        sldbstore[.sldb store + indexes]
    end

    subgraph localio[Local IO]
        files[Markdown files]
        fsa[File System Access API]
        bundle[Bundled examples]
        localdrafts[localStorage drafts]
    end

    app --> state
    state --> editor
    state --> viewer
    state --> panel
    state --> adapterM
    state --> adapterS

    adapterM --> parse
    adapterM --> render
    adapterM --> sourcemap
    adapterM --> markers

    adapterS --> docs
    adapterS --> contracts
    adapterS --> sectionops
    adapterS --> workflows
    docs --> sldbstore
    contracts --> sldbstore
    sectionops --> sldbstore
    workflows --> sldbstore

    editor <--> fsa
    editor <--> files
    state <--> localdrafts
    state --> bundle
```

## Reading

- `@sldb/ui` is the human entry surface.
- `@marcado/` is the canonical parse/render runtime.
- `@sldb/` owns tracked docs, model semantics, field operations, and store-backed workflows.
- Markdown remains the source of truth.
- The frontend should expose explicit adapters instead of mixing runtime logic into UI state.
