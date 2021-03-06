import E2eEditUtil from './helpers/e2e-edit-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import { InstalledReconfiguration, LatestReconfiguration } from './helpers/e2e-add-util'
import interactiveExecute, { KEYS } from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('Edit', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('editing with non-existent softwares file says nothing to edit', async () => {
    await E2eEditUtil.verifySoftwares(undefined, false)
    await testNoSoftwaresEdit()
    await E2eEditUtil.verifySoftwares([])
  })
  it('editing with no content softwares file says nothing to edit', async () => {
    await E2eEditUtil.setSoftwares(undefined)
    await E2eEditUtil.verifySoftwares(undefined)
    await testNoSoftwaresEdit()
    await E2eEditUtil.verifySoftwares([])
  })
  it('editing with empty array softwares file says nothing to edit', async () => {
    await E2eEditUtil.setSoftwares([])
    await E2eEditUtil.verifySoftwares([])
    await testNoSoftwaresEdit()
    await E2eEditUtil.verifySoftwares([])
  })
  it('cannot edit software to existing name', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit to name that already exists first',
      executable: {
        command: 'wrap',
      },
      args: 'greece',
      shellOverride: 'food',
      installedRegex: 'gyros',
      url: 'https://itsallgreektome.com',
      latestRegex: 'doner kebab',
    })
    const secondSoftware = new Software({
      name: 'e2e edit to name that already exists second',
      executable: {
        command: 'dessert',
      },
      args: 'italian',
      shellOverride: 'food',
      installedRegex: 'gelato',
      url: 'https://bestfoodonearth.com',
      latestRegex: 'artisanal gelato',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
    await testEditNameAlreadyExists({
      existingSoftwares: [firstSoftware, secondSoftware],
      positionToEdit: 0,
      name: secondSoftware.name,
    })
    await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
  })
  it('edit to installed error without reconfigure does not persist', async () => {
    const installedError = 'permission denied'
    const software = new Software({
      name: 'e2e edit installed error without reconfig',
      executable: {
        command: 'company',
      },
      args: 'mail',
      shellOverride: 'department',
      installedRegex: 'sears',
      url: 'https://catalogittome.com',
      latestRegex: 'Sears, Roebuck and Co.',
    })
    await E2eEditUtil.setSoftwares([software])
    await E2eEditUtil.verifySoftwares([software])
    await testReconfigureEdit({
      existingSoftwares: [software],
      positionToEdit: 0,
      name: `${software.name} edited`,
      installed: [
        {
          command: 'node',
          args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
          shellOverride: KEYS.BACK_SPACE,
          regex: 'v(.*)',
          error: installedError,
          confirmOrReconfigure: false,
        },
      ],
    })
    await E2eEditUtil.verifySoftwares([software])
  })
  it('edit to latest error without reconfigure does not persist', async () => {
    try {
      const installedVersion = '1.1.0'
      const software = new Software({
        name: 'e2e edit latest error without reconfig',
        executable: {
          command: 'theory',
        },
        args: 'universe',
        shellOverride: 'cosmology',
        installedRegex: 'singularity',
        url: 'https://expandonthis.com',
        latestRegex: 'the big bang',
      })
      const url = Website.getErrorUrl('could not connect')
      const port = Website.getPort()
      await Website.stop()
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await testReconfigureEdit({
        existingSoftwares: [software],
        positionToEdit: 0,
        name: `${software.name} edited`,
        installed: [
          {
            command: 'node',
            args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
            shellOverride: KEYS.BACK_SPACE,
            regex: 'v(.*)',
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url,
            regex: 'latest: v(.*)',
            error: `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`,
            confirmOrReconfigure: false,
          },
        ],
      })
      await E2eEditUtil.verifySoftwares([software])
    } finally {
      await Website.start()
    }
  })
  it('edit all fields single software', async () => {
    const oldSoftware = new Software({
      name: 'e2e edit all fields single old',
      executable: {
        command: 'periods',
      },
      args: 'technological',
      shellOverride: 'past',
      installedRegex: 'paleolithic',
      url: 'https://frombonetosatellite.com',
      latestRegex: 'information age',
    })
    await E2eEditUtil.setSoftwares([oldSoftware])
    await E2eEditUtil.verifySoftwares([oldSoftware])
    const installedVersion = '3.0.0'
    const latestVersion = '3.0.1'
    const editedSoftware = new Software({
      name: 'e2e edit all fields single edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [oldSoftware],
      positionToEdit: 0,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([editedSoftware])
  })
  it('edit all fields first of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit all fields first of two first',
      executable: {
        command: 'gods',
      },
      args: 'twins',
      shellOverride: 'greek',
      installedRegex: 'gemini',
      url: 'https://castortroyandpolluxtroy.com',
      latestRegex: 'dioscuri',
    })
    const lastSoftware = new Software({
      name: 'e2e edit all fields first of two last',
      executable: {
        command: 'philosophy',
      },
      args: 'concept',
      shellOverride: 'chinese',
      installedRegex: 'dualism',
      url: 'https://yinyang.com',
      latestRegex: 'cosmological qi',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
    const installedVersion = '1.1.0'
    const latestVersion = '2.1.0'
    const editedSoftware = new Software({
      name: 'e2e edit all fields first of two first edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToEdit: 0,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([editedSoftware, lastSoftware])
  })
  it('edit all fields last of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit all fields last of two first',
      executable: {
        command: 'boss',
      },
      args: 'mafia',
      shellOverride: 'hbo',
      installedRegex: 't',
      url: 'https://sadclown.com',
      latestRegex: 'anthony john soprano sr.',
    })
    const lastSoftware = new Software({
      name: 'e2e edit all fields last of two last',
      executable: {
        command: 'chemist',
      },
      args: 'drugs',
      shellOverride: 'amc',
      installedRegex: 'heisenberg',
      url: 'https://iamtheonewhoknocks.com',
      latestRegex: 'walter hartwell  white sr.',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
    const installedVersion = '1.1.0'
    const latestVersion = '1.2.0'
    const editedSoftware = new Software({
      name: 'e2e edit all fields last of two last edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToEdit: 1,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([firstSoftware, editedSoftware])
  })
  it('edits all fields installed error reconfigured', async () => {
    const command = 'node'
    const installedError = 'end of file'
    const installedVersion = '4.3.2'
    const latestVersion = '5.4.3'
    const oldSoftware = new Software({
      name: 'e2e edit all fields installed error reconfigured',
      executable: {
        command: 'mythology',
      },
      args: 'prisoner',
      shellOverride: 'greek',
      installedRegex: 'son-of-daedalus',
      url: 'https://flytothesun.com',
      latestRegex: 'icarus',
    })
    const newSoftware = new Software({
      name: `${oldSoftware.name} edited`,
      executable: {
        command,
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eEditUtil.setSoftwares([oldSoftware])
    await E2eEditUtil.verifySoftwares([oldSoftware])
    await testReconfigureEdit({
      existingSoftwares: [oldSoftware],
      positionToEdit: 0,
      name: newSoftware.name,
      installed: [
        {
          command,
          args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
          shellOverride: KEYS.BACK_SPACE,
          regex: newSoftware.installedRegex,
          error: installedError,
          confirmOrReconfigure: true,
        },
        {
          command,
          args: newSoftware.args,
          shellOverride: KEYS.BACK_SPACE,
          regex: newSoftware.installedRegex,
          version: installedVersion,
          confirmOrReconfigure: true,
        },
      ],
      latest: [
        {
          url: newSoftware.url,
          regex: newSoftware.latestRegex,
          version: latestVersion,
          confirmOrReconfigure: true,
        },
      ],
    })
    await E2eEditUtil.verifySoftwares([newSoftware])
  })
  it('edits all fields latest error reconfigured', async () => {
    const command = 'node'
    const latestError = 'could not connect'
    const installedVersion = '7.8.9'
    const latestVersion = '10.9.8'
    const oldSoftware = new Software({
      name: 'e2e edit all fields latest error reconfigured',
      executable: {
        command: 'golf',
      },
      args: 'clubs',
      shellOverride: 'sports',
      installedRegex: 'wood',
      url: 'https://onthescrews.com',
      latestRegex: 'driver',
    })
    const newSoftware = new Software({
      name: `${oldSoftware.name} edited`,
      executable: {
        command,
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eEditUtil.setSoftwares([oldSoftware])
    await E2eEditUtil.verifySoftwares([oldSoftware])
    await testReconfigureEdit({
      existingSoftwares: [oldSoftware],
      positionToEdit: 0,
      name: newSoftware.name,
      installed: [
        {
          command,
          args: newSoftware.args,
          shellOverride: KEYS.BACK_SPACE,
          regex: newSoftware.installedRegex,
          version: installedVersion,
          confirmOrReconfigure: true,
        },
      ],
      latest: [
        {
          url: Website.getErrorUrl(latestError),
          regex: newSoftware.latestRegex,
          error: `Could not find match for regex '/${newSoftware.latestRegex}/' in text '${latestError}'`,
          confirmOrReconfigure: true,
        },
        {
          url: newSoftware.url,
          regex: newSoftware.latestRegex,
          version: latestVersion,
          confirmOrReconfigure: true,
        },
      ],
    })
    await E2eEditUtil.verifySoftwares([newSoftware])
  })
})

async function testNoSoftwaresEdit() {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Edit), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
  })
  await E2eEditUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
    E2eEditUtil.MESSAGES.NoSoftwares,
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}

async function testEditNameAlreadyExists({
  existingSoftwares,
  positionToEdit,
  name,
}: {
  existingSoftwares: Software[]
  positionToEdit: number
  name: string
}) {
  const existingName = existingSoftwares[positionToEdit].name
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
      ...E2eEditUtil.getInputsNavigate(positionToEdit),
      name,
      KEYS.Enter,
    ],
  })
  await E2eEditUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
    ...E2eEditUtil.getChunksNavigate({
      existingSoftwares,
      nameToEdit: existingName,
    }),
    {
      question: 'Name to identify new software',
      answer: name,
      default: existingName,
    },
    E2eEditUtil.getNameInUseMessage(name),
    `? Name to identify new software: (${existingName}) `,
  ])
}

async function testReconfigureEdit({
  existingSoftwares,
  positionToEdit,
  name,
  installed,
  latest = [],
}: {
  existingSoftwares: Software[]
  positionToEdit: number
  name: string
  installed: InstalledReconfiguration[]
  latest?: LatestReconfiguration[]
}) {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
      ...E2eEditUtil.getInputsReconfigure({
        position: positionToEdit,
        name,
        installed,
        latest,
        oldSoftware: existingSoftwares[positionToEdit],
      }),
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
    ],
  })
  await E2eEditUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
    ...E2eEditUtil.getChunksReconfigure({
      existingSoftwares,
      oldSoftware: existingSoftwares[positionToEdit],
      name,
      installed,
      latest,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}

async function testDefaultEdit({
  existingSoftwares,
  positionToEdit,
  newSoftware,
  newInstalledVersion,
  newLatestVersion,
}: {
  existingSoftwares: Software[]
  positionToEdit: number
  newSoftware: Software
  newInstalledVersion: string
  newLatestVersion: string
}) {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
      ...E2eEditUtil.getInputs({
        position: positionToEdit,
        newSoftware,
        oldSoftware: existingSoftwares[positionToEdit],
      }),
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
    ],
  })
  await E2eEditUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
    ...E2eEditUtil.getChunks({
      existingSoftwares,
      oldSoftware: existingSoftwares[positionToEdit],
      newSoftware,
      installedVersion: newInstalledVersion,
      latestVersion: newLatestVersion,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}
