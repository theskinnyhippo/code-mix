import Avatar from 'react-avatar';

function Client({ username }) {
    return (
        <div className='w-full bg-white/5 shadow-md shadow-black rounded-xl mb-2'>
            <div className='flex items-start m-3 rounded-full gap-x-3'>
                <Avatar name={username.toString()} size="35" className='rounded-full' />
                <span className='text-md pt-1'>{username.toString()}</span>
            </div>
        </div>
    );
}

export default Client;