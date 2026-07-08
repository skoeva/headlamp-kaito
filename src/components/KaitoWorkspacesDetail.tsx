import { useTranslation } from '@kinvolk/headlamp-plugin/lib';
import {
  ActionButton,
  ConditionsSection,
  DetailsGrid,
  MetadataDictGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatUI from './ChatUI';
import { Workspace } from './resources/workspace';

const StringArray = ({ items }: { items?: string[] }) => (items?.length ? items.join(', ') : '');

export function WorkspaceDetail() {
  const { t } = useTranslation();
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const [chatOpen, setChatOpen] = useState(false);
  const [_selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const handleChat = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedWorkspace(null);
  };

  return (
    <>
      <DetailsGrid
        name={name}
        namespace={namespace}
        resourceType={Workspace}
        withEvents
        actions={item =>
          item && [
            {
              id: 'chat',
              action: (
                <ActionButton
                  description={t('Chat')}
                  aria-label="chat"
                  icon="mdi:chat"
                  onClick={() => handleChat(item)}
                />
              ),
            },
          ]
        }
        // Resources section
        extraSections={(item: Workspace) =>
          item && [
            {
              id: 'ResourceSpec',
              section: item.resource && (
                <SectionBox title={t('Resources')}>
                  <NameValueTable
                    rows={[
                      {
                        name: t('Count'),
                        value: item.resource.count?.toString(),
                      },
                      {
                        name: t('Instance Type'),
                        value: item.resource.instanceType,
                      },
                      {
                        name: t('Preferred Nodes'),
                        value: <StringArray items={item.resource.preferredNodes} />,
                      },
                      {
                        name: t('Node Selector'),
                        value: item.resource.labelSelector?.matchLabels && (
                          <MetadataDictGrid
                            dict={
                              item.resource.labelSelector.matchLabels as { [key: string]: string }
                            }
                          />
                        ),
                      },
                    ]}
                  />
                </SectionBox>
              ),
            },
            // Inference section
            {
              id: 'InferenceSpec',
              section: item.inference && (
                <SectionBox title={t('Inference')}>
                  <NameValueTable
                    rows={[
                      {
                        name: t('Preset Name'),
                        value: item.inference.preset?.name,
                      },
                      {
                        name: t('Preset Image'),
                        value: item.inference.preset?.presetOptions?.image,
                      },
                      {
                        name: t('Config'),
                        value: item.inference.config,
                      },
                      {
                        name: t('Adapters'),
                        value: item.inference.adapters
                          ? item.inference.adapters
                              .map(a => `${a.source?.name} (${a.strength})`)
                              .join(', ')
                          : '',
                      },
                    ]}
                  />
                </SectionBox>
              ),
            },
            // Tuning section
            {
              id: 'TuningSpec',
              section: item.tuning && (
                <SectionBox title={t('Tuning')}>
                  <NameValueTable
                    rows={[
                      {
                        name: t('Preset Name'),
                        value: item.tuning.preset?.name,
                      },
                      {
                        name: t('Preset Image'),
                        value: item.tuning.preset?.presetOptions?.image,
                      },
                      {
                        name: t('Tuning Method'),
                        value: item.tuning.method,
                      },
                      {
                        name: t('Config'),
                        value: item.tuning.config,
                      },
                      {
                        name: t('Input Data Source'),
                        value: item.tuning.input?.name,
                      },
                      {
                        name: t('Output Data Destination'),
                        value: item.tuning.output?.volumeSource ? t('Volume') : '',
                      },
                    ]}
                  />
                </SectionBox>
              ),
            },
            // Status section
            {
              id: 'Status',
              section: item.status?.conditions && (
                <SectionBox title={t('Status')}>
                  <NameValueTable
                    rows={[
                      {
                        name: t('Worker Nodes'),
                        value: item.status.workerNodes?.join(', ') || '',
                      },
                      ...item.status.conditions.map(c => ({
                        name: c.type,
                        value: `${c.status} ${c.reason ? `(${c.reason})` : ''} ${
                          c.message ? `- ${c.message}` : ''
                        }`,
                      })),
                    ]}
                  />
                </SectionBox>
              ),
            },
            // Conditions sections (flattened)
            ...(item.status?.conditions
              ? [
                  {
                    id: 'headlamp.workload-conditions',
                    section: <ConditionsSection resource={item?.jsonData} />,
                  },
                ]
              : []),
          ]
        }
      />
      {chatOpen && (
        <ChatUI
          open={chatOpen}
          onClose={handleCloseChat}
          namespace={namespace}
          workspaceName={name}
        />
      )}
    </>
  );
}
