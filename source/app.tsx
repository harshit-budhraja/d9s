import React, { useState, useEffect } from 'react';
import { Box, Key, Newline, Text, useInput } from 'ink';
import Docker from 'dockerode';
import terminalSize from 'terminal-size';

const dkrVersion = '0.0.1';

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
	dkr_orange: '#ffa500',
	dkr_brown: '#dc3a28',
	dkr_blue: '#0f63cc',
	dkr_gray: '#b6b1b7',
	dkr_lightblue: '#84cbfa',
};

const docker = new Docker();

export default function App() {
	const [dockerInfo, setDockerInfo] = useState<any>(null);

	useEffect(() => {
		console.clear();

		const fetchData = async () => {
			try {
				const dockerInfo = await docker.info();
				setDockerInfo(dockerInfo);
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
	});

	return (
		<Box flexDirection="column" height={terminalSize().rows - 1}>
			{dockerInfo && (
				<Box flexDirection="column" marginLeft={1}>
					<Text>
						<Text color={colorMap['dkr_orange']}>Context: </Text>
						{
							dockerInfo.OperatingSystem ?
							<Text bold>{dockerInfo.OperatingSystem}</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['dkr_orange']}>User: </Text>
						{
							dockerInfo.Name ?
							<Text bold>{dockerInfo.Name}</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['dkr_orange']}>Platform: </Text>
						{
							dockerInfo.OSType && dockerInfo.Architecture ?
							<Text bold>{dockerInfo.OSType} ({dockerInfo.Architecture})</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['dkr_orange']}>Dkr Rev: </Text>
						<Text bold>v{dkrVersion}</Text>
						<Newline />
						<Text color={colorMap['dkr_orange']}>Docker Rev: </Text>
						{
							dockerInfo.ServerVersion ?
							<Text bold>v{dockerInfo.ServerVersion}</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['dkr_orange']}>CPUs: </Text>
						{
							dockerInfo.NCPU ?
							<Text bold>{dockerInfo.NCPU}</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
						<Newline />
						<Text color={colorMap['dkr_orange']}>MEM: </Text>
						{
							dockerInfo.MemTotal ?
							<Text bold>{Math.ceil(dockerInfo.MemTotal / (1024 * 1024 * 1024)).toFixed(2)} GB</Text> :
							<Text bold color={colorMap['dkr_brown']}>n/a</Text>
						}
					</Text>
				</Box>
			)}

			<Box flexGrow={1} borderStyle="single" borderColor={colorMap['dkr_lightblue']}>
				<Box>
					<Text color={colorMap['dkr_lightblue']}>Containers</Text>
				</Box>
			</Box>

			<Box marginLeft={1}>
				<Text bold color={colorMap['black']} backgroundColor={colorMap['dkr_orange']}>{" <container> "}</Text>
			</Box>
		</Box>
	);
}
