import Client from '../client';
import inquirer from 'inquirer';
import getUser from '../get-user';
import getTeams from '../get-teams';
import { Org } from '../../types';
import wait from '../output/wait';

type Choice = { name: string; value: Org };

export default async function selectProject(
  question: string,
  client: Client,
  currentTeam?: string
): Promise<Org> {
  require('./patch-inquirer');

  const spinner = wait('Loading organizations…', 1000);
  const [user, teams] = await Promise.all([getUser(client), getTeams(client)]);
  spinner();

  const choices: Choice[] = [
    {
      name: user.name || user.username,
      value: { type: 'user', id: user.uid, slug: user.username },
    },
    ...teams.map<Choice>(team => ({
      name: team.name || team.slug,
      value: { type: 'team', id: team.id, slug: team.slug },
    })),
  ];

  const answers = await inquirer.prompt({
    type: 'list',
    name: 'org',
    message: question,
    choices,
    default: teams.findIndex(team => team.id === currentTeam) + 1,
  });

  const org = answers.org;
  return org;
}
