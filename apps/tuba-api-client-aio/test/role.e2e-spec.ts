import {
  CreateRolesRequest,
  GrantRolesRequest,
  RolesApi,
} from '../src/apis/RolesApi'
import { RoleDto, UserRoleChangeReport } from '../src/models'
import { DEFAULTS, apiClientConfig } from './api-connect.helper'

const defaultNewRoles: RoleDto[] = [
  {
    type: 'admin',
    value: '0x3078303000000000000000000000000000000000000000000000000000000000',
    label: 'Admin',
    description: 'Market administrator of a market',
  },
  {
    type: 'open',
    value: '0x3078313030000000000000000000000000000000000000000000000000000000',
    label: 'Open',
    description: 'Open role',
  },
  {
    type: 'issuer',
    value: '0x3078323030000000000000000000000000000000000000000000000000000000',
    label: 'Token Issuer',
    description: 'Token issuer role on a given market',
  },
  {
    type: 'buyer',
    value: '0x3078333030000000000000000000000000000000000000000000000000000000',
    label: 'Investor',
    description: 'Investor role on a given market and sale(s)',
  },
]

describe('User Roles API (e2e)', () => {
  let apiClient: RolesApi

  beforeEach(async () => {
    apiClient = new RolesApi(apiClientConfig)
  })

  // it('/health (GET)', () => {
  //   apiClient
  //     .getHealth()
  //     .then((res) => {
  //       expect(res.status).toEqual('ok')
  //     })
  //     .catch((err) => {
  //       fail(err)
  //     })
  // })

  it('/roles (GET) - Retrieve all available roles', () => {
    apiClient
      .getRolesAll()
      .then((resp) => {
        const roles: RoleDto[] = resp.roles
        expect(roles).not.toEqual([])
        expect(roles.length).toBeGreaterThan(0)
      })
      .catch((err) => {
        fail(err)
      })
  })

  it('/roles (POST) - Create/store new roles', () => {
    const createRolesRequest: CreateRolesRequest = {
      roleDto: defaultNewRoles,
    }
    apiClient
      .createRoles(createRolesRequest)
      .then((createdRoleIds: number[]) => {
        expect(createdRoleIds).not.toEqual([])
      })
      .catch((err) => {
        fail(err)
      })
  })

  it('/roles/grant (POST)', () => {
    const grantRoleRequest: GrantRolesRequest = {
      grantRoleDto: [
        {
          userWalletAddress: DEFAULTS.userWalletAddress,
          roleId: 1,
          marketId: 1,
        },
      ],
    }
    apiClient
      .grantRoles(grantRoleRequest)
      .then((res: UserRoleChangeReport) => {
        expect(res).not.toEqual([])
        expect(res.userRoles).toBeGreaterThan(0)
        expect(res.fails).toBeUndefined()
      })
      .catch((err) => {
        fail(err)
      })
  })
})
