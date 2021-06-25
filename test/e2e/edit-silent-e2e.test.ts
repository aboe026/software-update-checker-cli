import { CommandType, isStatic } from '../../src/executable'
import E2eAddUtil from './helpers/e2e-add-util'
import E2eEditUtil from './helpers/e2e-edit-util'
import interactiveExecute from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('Edit Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('edit silent with non-existent softwares file says does not exist', async () => {
      await E2eEditUtil.verifySoftwares(undefined, false)
      const existingName = 'Chinook'
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'Sockeye',
            type: CommandType.Static,
            command: 'fish',
            args: 'salmon',
            shellOverride: 'animals',
            installedRegex: 'red',
            url: 'https://swimupstream.com',
            latestRegex: 'oncorhynchus nerka',
          },
        }),
        error: E2eEditUtil.getNonExistingSoftwareMessage(existingName),
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent with no content softwares file says does not exist', async () => {
      await E2eEditUtil.setSoftwares(undefined)
      await E2eEditUtil.verifySoftwares(undefined)
      const existingName = 'Douglas Fir'
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'Big Tree',
            type: CommandType.Static,
            command: 'trees',
            args: 'conifers',
            shellOverride: 'plants',
            installedRegex: 'redwood',
            url: 'https://longnecks.com',
            latestRegex: 'sequoia',
          },
        }),
        error: E2eEditUtil.getNonExistingSoftwareMessage(existingName),
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent with empty array softwares file says does not exist', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      const existingName = 'VGA'
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'HDMI',
            type: CommandType.Static,
            command: 'interface',
            args: 'av',
            shellOverride: 'digital',
            installedRegex: 'hdmi',
            url: 'https://sweetsweethidef.com',
            latestRegex: 'high definition multimedia interface',
          },
        }),
        error: E2eEditUtil.getNonExistingSoftwareMessage(existingName),
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent prevents using an existing name', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent to name that already exists first',
        executable: {
          command: 'presidents',
        },
        args: 'usa',
        shellOverride: 'people',
        installedRegex: 'first',
        url: 'https://fatherofthenation.com',
        latestRegex: 'george washington',
      })
      const secondSoftware = new Software({
        name: 'e2e edit silent to name that already exists second',
        executable: {
          command: 'ruler',
        },
        args: 'rome',
        shellOverride: 'person',
        installedRegex: 'last',
        url: 'https://littledisgrace.com',
        latestRegex: 'romulus augustus',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: firstSoftware.name,
          newSoftware: {
            name: secondSoftware.name,
          },
        }),
        error: E2eEditUtil.getNameInUseMessage(secondSoftware.name),
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
    })
    it('edit silent to installed error does not persist', async () => {
      const installedError = 'syntax error'
      const software = new Software({
        name: 'e2e edit silent installed error',
        executable: {
          command: 'actors',
        },
        args: 'movie',
        shellOverride: 'male',
        installedRegex: 'the chip',
        url: 'https://sixdegrees.org',
        latestRegex: 'kevin norwood bacon',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: 'node',
            args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
            shellOverride: '',
            installedRegex: 'v(.*)',
          },
        }),
        error: E2eAddUtil.getInstalledErrorMessage(installedError),
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent to latest error does not persist', async () => {
      try {
        const installedVersion = '1.1.0'
        const software = new Software({
          name: 'e2e edit silent latest error',
          executable: {
            command: 'dissolves',
          },
          args: 'yield anions',
          shellOverride: 'substances',
          installedRegex: 'electrolytes',
          url: 'https://itswhatplantscrave.com',
          latestRegex: 'brwando',
        })
        const url = Website.getErrorUrl('could not connect')
        const port = Website.getPort()
        await Website.stop()
        await E2eEditUtil.setSoftwares([software])
        await E2eEditUtil.verifySoftwares([software])
        await E2eEditUtil.testSilentError({
          args: E2eEditUtil.getSilentCommand({
            existingName: software.name,
            newSoftware: {
              name: `${software.name} edited`,
              command: 'node',
              args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
              shellOverride: '',
              installedRegex: 'v(.*)',
              url,
              latestRegex: 'latest: v(.*)',
            },
          }),
          error: E2eAddUtil.getLatestErrorMessage(
            `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`
          ),
        })
        await E2eEditUtil.verifySoftwares([software])
      } finally {
        await Website.start()
      }
    })
    it('edit silent errors without options', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: 'toast',
          newSoftware: {},
        }),
        error: E2eEditUtil.MESSAGES.NoOptions,
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent requires existing name positional argument', async () => {
      const software = new Software({
        name: 'e2e edit silent no existing name positional argument',
        executable: {
          command: 'norse',
        },
        args: 'god',
        shellOverride: 'mythology',
        installedRegex: 'woden',
        url: 'https://wednesday.com',
        latestRegex: 'odin',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: undefined,
          newSoftware: {
            name: `${software.name} edited`,
          },
        }),
        error: E2eEditUtil.getNotEnoughCommandsMessage(0, 1),
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent directory flag does not work with static type', async () => {
      const software = new Software({
        name: 'e2e edit silent directory flag does not work with static type',
        executable: {
          command: 'gaming',
        },
        args: 'console',
        shellOverride: 'platform',
        installedRegex: 'directx',
        url: 'https://staggersticks4life.com',
        latestRegex: 'xbox',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Static,
            directory: 'duke',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleDirectoryWithStaticType,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent regex flag does not work with static type', async () => {
      const software = new Software({
        name: 'e2e edit silent regex flag does not work with static type',
        executable: {
          command: 'scientist',
        },
        args: 'nobel-laureate',
        shellOverride: 'female',
        installedRegex: 'physics|chemistry',
        url: 'https://motherofmodernphysics.com',
        latestRegex: 'marie curie',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Static,
            regex: 'radioactivity',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleRegexWithStaticType,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag does not work with dynamic type', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag does not work with dynamic type',
        executable: {
          command: 'seed',
        },
        args: 'theobroma',
        shellOverride: 'bean',
        installedRegex: 'cocoa',
        url: 'https://darkormilk.com',
        latestRegex: 'chocolate',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Dynamic,
            command: 'liquor',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithDynamicType,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag not compatible with directory flag', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag not compatible with directory flag',
        executable: {
          command: 'apollo',
        },
        args: '11',
        shellOverride: 'astronaut',
        installedRegex: 'commander',
        url: 'https://onesmallstep.com',
        latestRegex: 'neil armstrong',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: 'lunar',
            directory: 'eagle',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithDirectory,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag not compatible with regex flag', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag not compatible with regex flag',
        executable: {
          command: 'volcano',
        },
        args: 'cascades',
        shellOverride: 'geology',
        installedRegex: 'tahoma',
        url: 'https://thelonelymountain.com',
        latestRegex: 'mount rainier',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: '',
            regex: '',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithRegex,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag not compatible with dynamic executable', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag not compatible with dynamic executable',
        executable: {
          directory: 'bread',
          regex: 'flat',
        },
        args: 'italian',
        shellOverride: 'carbohydrates',
        installedRegex: 'focaccia',
        url: 'https://protopizza.com',
        latestRegex: 'panis focacius',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: 'rise',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithDynamicExecutable,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent directory flag not compatible with static executable', async () => {
      const software = new Software({
        name: 'e2e edit silent directory flag not compatible with static executable',
        executable: {
          command: 'cheers',
        },
        args: 'norwegian',
        shellOverride: 'phrase',
        installedRegex: 'skoal',
        url: 'https://illdrinktothat.com',
        latestRegex: 'takk skal du ha',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            directory: 'toast',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleDirectoryWithStaticExecutable,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent regex flag not compatible with static executable', async () => {
      const software = new Software({
        name: 'e2e edit silent regex flag not compatible with static executable',
        executable: {
          command: 'avian',
        },
        args: 'sweet-beak',
        shellOverride: 'animal',
        installedRegex: 'ruby throated hummingbird',
        url: 'https://backwardsandupsidedown.com',
        latestRegex: 'crchilochus colubris',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            regex: 'hum',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleRegexWithStaticExecutable,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent change type to dynamic errors without directory option', async () => {
      const software = new Software({
        name: 'e2e edit silent change type to dynamic without directory',
        executable: {
          command: 'constellation',
        },
        args: 'equator',
        shellOverride: 'astronomy',
        installedRegex: 'hunter',
        url: 'https://beltofstars.com',
        latestRegex: 'orion',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Dynamic,
            regex: 'giant',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoDirectoryForDynamic,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent change type to dynamic errors without regex option', async () => {
      const software = new Software({
        name: 'e2e edit silent change type to dynamic without regex',
        executable: {
          command: 'mathematician',
        },
        args: 'male',
        shellOverride: 'english',
        installedRegex: 'computer\\ scientist|logician|cryptanalyst|philosopher|theoretical biologist',
        url: 'https://fatherofcomputers.com',
        latestRegex: 'alan mathison turing',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Dynamic,
            directory: 'ai',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoDirectoryForRegex,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent change type to static errors without command option', async () => {
      const software = new Software({
        name: 'e2e edit silent change type to static without command',
        executable: {
          directory: 'hotel',
          regex: 'overlook',
        },
        args: 'room',
        shellOverride: 'number',
        installedRegex: 'avoid',
        url: 'https://theshine.com',
        latestRegex: '237',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eEditUtil.testSilentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Static,
          },
        }),
        error: E2eEditUtil.MESSAGES.NoCommandForStatic,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
  })
  describe('valid', () => {
    it('edit silent all fields single software', async () => {
      const oldSoftware = new Software({
        name: 'e2e edit silent all fields single old',
        executable: {
          command: 'cities',
        },
        args: 'north dakota',
        shellOverride: 'geography',
        installedRegex: 'largest',
        url: 'https://youbetcha.com',
        latestRegex: 'fargo',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      const installedVersion = '3.1.0'
      const latestVersion = '3.1.1'
      const editedSoftware = new Software({
        name: 'e2e edit silent all fields single edited',
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
        existingName: oldSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware])
    })
    it('edit silent all fields first of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent all fields first of two first',
        executable: {
          command: 'galaxy',
        },
        args: 'nearest',
        shellOverride: 'astrology',
        installedRegex: 'andromeda',
        url: 'https://sonearyetsofar.com',
        latestRegex: 'Messier 31',
      })
      const lastSoftware = new Software({
        name: 'e2e edit silent all fields first of two last',
        executable: {
          command: 'meat',
        },
        args: 'steaks',
        shellOverride: 'beef',
        installedRegex: 'top loin',
        url: 'https://itswhatsfordinner.com',
        latestRegex: 'new york strip',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.2.0'
      const latestVersion = '2.2.0'
      const editedSoftware = new Software({
        name: `${firstSoftware.name} edited`,
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
        existingName: firstSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware, lastSoftware])
    })
    it('edit silent all fields last of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent all fields last of two first',
        executable: {
          command: 'equipment',
        },
        args: 'farming',
        shellOverride: 'machine',
        installedRegex: 'thresher',
        url: 'https://westernminnesotasteamthreshersreunion.com',
        latestRegex: 'garr-scott',
      })
      const lastSoftware = new Software({
        name: 'e2e edit silent all fields last of two last',
        executable: {
          command: 'owner',
        },
        args: 'factory',
        shellOverride: 'character',
        installedRegex: 'candy',
        url: 'https://snozberries.com',
        latestRegex: 'willy wonka',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.1.1'
      const latestVersion = '1.2.1'
      const editedSoftware = new Software({
        name: `${lastSoftware.name} edited`,
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
        existingName: lastSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([firstSoftware, editedSoftware])
    })
  })
})

async function testDefaultEdit({
  existingName,
  newSoftware,
  newInstalledVersion,
  newLatestVersion,
}: {
  existingName: string
  newSoftware: Software
  newInstalledVersion: string
  newLatestVersion: string
}) {
  const response = await interactiveExecute({
    args: E2eEditUtil.getSilentCommand({
      existingName,
      newSoftware: {
        name: newSoftware.name,
        type: CommandType.Static,
        command: isStatic(newSoftware.executable) ? newSoftware.executable.command : '',
        args: newSoftware.args,
        shellOverride: newSoftware.shellOverride,
        installedRegex: newSoftware.installedRegex,
        url: newSoftware.url,
        latestRegex: newSoftware.latestRegex,
      },
    }),
  })
  await E2eEditUtil.validateChunks(response.chunks, [
    ...E2eEditUtil.getChunksSilent({
      installedVersion: newInstalledVersion,
      latestVersion: newLatestVersion,
    }),
  ])
}