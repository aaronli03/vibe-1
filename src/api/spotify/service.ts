import type { SongDetails, SearchDetails, ArtistDetails } from 'src/types/Details';
import type { Song, Artist, LocalStorage } from 'src/api/spotify/types';
import fetch from 'cross-fetch';

export async function getUserData() {
	const accessToken = localStorage.getItem('access_token');
	const response = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (!response.ok) {
		console.log('getUserData error');
	}
	const responseData = await response.json();
	const data = {
		display_name: responseData.display_name,
		user_id: responseData.id
	};
	return data;
}

export async function getSongs(params: string): Promise<SongDetails[]> {
	const storedValue: string | null = localStorage.getItem('ViBE');
	if (storedValue !== null) {
		const obj: LocalStorage = JSON.parse(storedValue);
		const accessToken = obj.access_token;
		const response = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (!response.ok) {
			console.log('getSongs error');
		}
		const responseData = await response.json();
		const songArray = responseData.tracks;
		const songList: SongDetails[] = [];
		songArray.forEach((song: Song) => {
			const artists = song.artists.map((artist) => artist.name);
			const newSong = {
				songid: `${song.id}`,
				title: `${song.name}`,
				artists: artists,
				image: song.album.images[0].url,
				previewAudio: `${song.preview_url ? song.preview_url : null}`
			};
			songList.push(newSong);
		});
		return songList;
	}
	return [];
}

export async function search(input: string, limit: number): Promise<SearchDetails[]> {
	const storedValue: string | null = localStorage.getItem('ViBE');
	console.log(storedValue);
	if (storedValue !== null) {
		const obj: LocalStorage = JSON.parse(storedValue);
		const accessToken = obj.access_token;
		const typeList: string[] = ['artist', 'track'];
		const params = new URLSearchParams({
			q: `${input}`,
			type: `${typeList}`,
			limit: `${limit}`
		});
		const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (!response.ok) {
			console.log('search error');
		}
		const responseData = await response.json();
		const songArray = responseData.tracks.items as Song[];
		const artistArray = responseData.artists.items as Artist[];
		const searchList: SearchDetails[] = [];
		songArray.forEach((song: Song) => {
			const artists: string[] = song.artists.map((artist: Artist) => artist.name);
			const newSong: SongDetails = {
				songid: song.id,
				title: song.name,
				artists: artists,
				image: song.album.images[0].url,
				previewAudio: song.preview_url ? song.preview_url : null
			};
			const newSearch: SearchDetails = {
				type: `${song.type}`,
				data: newSong
			};
			searchList.push(newSearch);
		});
		artistArray.forEach((artist: Artist) => {
			const newArtist: ArtistDetails = {
				artistid: `${artist.id}`,
				name: `${artist.name}`,
				image: `${artist.images[0].url}`
			};
			const newSearch: SearchDetails = {
				type: `${artist.type}`,
				data: newArtist
			};
			searchList.push(newSearch);
		});
		return searchList;
	}
	return [];
}
