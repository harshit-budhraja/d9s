import React, { useState, useEffect } from 'react';
import { Box, Key, Newline, Text, useInput } from 'ink';
import Docker from 'dockerode';
import terminalSize from 'terminal-size';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

const d9sVersion = '0.0.1';

const colorMap: {
	[key: string]: string;
} = {
	white: '#ffffff',
	black: '#000000',
	red: '#ff0000',
	green: '#00ff00',
	blue: '#0000ff',
	yellow: '#ffff00',
	purple: '#800080',
	pink: '#ffc0cb',
	cyan: '#00ffff',
	gray: '#808080',
	d9s_orange: '#ffa500',
	d9s_brown: '#dc3a28',
	d9s_blue: '#0f63cc',
	d9s_gray: '#b6b1b7',
	d9s_lightblue: '#84cbfa',
	d9s_highlightblue: '#28abee',
};

const docker = new Docker();

export default function App() {
	const [dockerInfo, setDockerInfo] = useState<any>(null);
	const [containers, setContainers] = useState<Docker.ContainerInfo[]>([]);
	const [selectedRow, setSelectedRow] = useState<number>(6);

	useEffect(() => {
		console.clear();

		const fetchData = async () => {
			try {
				const dockerInfo = await docker.info();
				const containerInfo = await docker.listContainers();
				setDockerInfo(dockerInfo);
				setContainers(containerInfo);
			} catch (err: any) {
				console.error(err);
			}
		};

		fetchData();
	}, []);

	useInput((input: string, key: Key) => {
		if (key.ctrl && input === 'c') {
			console.clear();
			process.exit(0);
		}

		if (key.downArrow || key.upArrow) {
			if (key.downArrow) {
				setSelectedRow(selectedRow + 1);
			} else if (key.upArrow) {
				setSelectedRow(selectedRow - 1);
			}
		}
	});

	if (!dockerInfo) {
		return (
			<Box>
				<Text>Loading...</Text>
			</Box>
		);
	}

	const selectedRowProps = {
		color: colorMap['d9s_lightblue'],
		bold: true,
		underline: true,
	};

	const unselectedRowProps = {
		color: colorMap['d9s_lightblue'],
		dimColor: true,
	};

	return (
		<Box flexDirection="column" height={terminalSize().rows - 1}>
			<Box flexDirection="row" justifyContent="space-between" marginBottom={-1}>
				<Box flexDirection="column" marginLeft={1}>
					<Text>
						<Text color={colorMap['d9s_orange']}>Context: </Text>
						{
							dockerInfo.OperatingSystem ?
								<Text bold>{dockerInfo.OperatingSystem}</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['d9s_orange']}>User: </Text>
						{
							dockerInfo.Name ?
								<Text bold>{dockerInfo.Name}</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['d9s_orange']}>Platform: </Text>
						{
							dockerInfo.OSType && dockerInfo.Architecture ?
								<Text bold>{dockerInfo.OSType} ({dockerInfo.Architecture})</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['d9s_orange']}>D9s Rev: </Text>
						<Text bold>v{d9sVersion}</Text>
						<Newline />
						<Text color={colorMap['d9s_orange']}>Docker Rev: </Text>
						{
							dockerInfo.ServerVersion ?
								<Text bold>v{dockerInfo.ServerVersion}</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['d9s_orange']}>CPUs: </Text>
						{
							dockerInfo.NCPU ?
								<Text bold>{dockerInfo.NCPU}</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['d9s_orange']}>MEM: </Text>
						{
							dockerInfo.MemTotal ?
								<Text bold>{Math.ceil(dockerInfo.MemTotal / (1024 * 1024 * 1024)).toFixed(2)} GB</Text> :
								<Text bold color={colorMap['d9s_brown']}>n/a</Text>
						}
					</Text>
				</Box>

				<Box flexDirection="column" marginRight={140}>
					<Text>
						<Text color={colorMap['d9s_blue']} bold>{"<ctrl+c>: "}</Text>
						<Text color={colorMap['d9s_gray']}>quit</Text>
						<Newline />
						<Text color={colorMap['d9s_blue']} bold>{"<up-arrow>: "}</Text>
						<Text color={colorMap['d9s_gray']}>move up</Text>
						<Newline />
						<Text color={colorMap['d9s_blue']} bold>{"<down-arrow>: "}</Text>
						<Text color={colorMap['d9s_gray']}>move down</Text>
					</Text>
				</Box>

				<Box marginRight={3}>
					<Gradient name="rainbow">
						<BigText text='d9s' font='simple' letterSpacing={0} />
					</Gradient>
				</Box>
			</Box>

			<Box flexGrow={1} borderStyle="single" borderColor={colorMap['d9s_lightblue']}>
				<Box flexDirection="column" gap={0}>
					<Box justifyContent="flex-start" width={terminalSize().columns - 1} marginLeft={1}>
						<Box>
							<Text bold color="cyan">Containers[{<Text color="yellow">{containers.filter(container => !container.Labels.hasOwnProperty('io.kubernetes.pod.uid')).length}</Text>}]</Text>
						</Box>
					</Box>

					<Box flexDirection="row" justifyContent="space-between" width={terminalSize().columns - 10} marginLeft={1} marginTop={1}>
						<Box width={70}>
							<Text bold>NAME</Text>
						</Box>
						<Box width={50}>
							<Text bold>IMAGE</Text>
						</Box>
						<Box width={20}>
							<Text bold>STATUS</Text>
						</Box>
						<Box width={50}>
							<Text bold>PORTS</Text>
						</Box>
						<Box width={50}>
							<Text bold>AGE</Text>
						</Box>
					</Box>

					{
						containers.map((container, index) => {
							if (!container.Labels.hasOwnProperty('io.kubernetes.pod.uid')) {
								return (
									<Box key={index} flexDirection="row" justifyContent="space-between" width={terminalSize().columns - 10} marginLeft={1}>
										<Box width={70}>
											<Text {...(index === selectedRow ? selectedRowProps : unselectedRowProps)}>{container.Names[0]!.replace('/', '')}</Text>
										</Box>
										<Box width={50}>
											<Text {...(index === selectedRow ? selectedRowProps : unselectedRowProps)}>{
												container.Image.toString().length > 50 ?
												container.Image.toString().substring(0, 47) + '...' :
												container.Image.toString()
											}</Text>
										</Box>
										<Box width={20}>
											<Text {...(index === selectedRow ? selectedRowProps : unselectedRowProps)}>{container.State}</Text>
										</Box>
										<Box width={50}>
											<Text {...(index === selectedRow ? selectedRowProps : unselectedRowProps)}>{container.Ports.map(port => port.IP === '0.0.0.0' ? port.PublicPort : null).filter(port => port).join(",")}</Text>
										</Box>
										<Box width={50}>
											<Text {...(index === selectedRow ? selectedRowProps : unselectedRowProps)}>{container.Status}</Text>
										</Box>
									</Box>
								);
							}

							return null;
						})
					}
				</Box>
			</Box>

			<Box marginLeft={1}>
				<Text bold color={colorMap['black']} backgroundColor={colorMap['d9s_orange']}>{" <container> "}</Text>
			</Box>
		</Box>
	);
}
